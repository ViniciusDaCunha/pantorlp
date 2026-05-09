import { createClient } from "@supabase/supabase-js";
import type { WaitlistFormData, WaitlistSubmitResult, VisitorEventType } from "@/types";


// ─── Client ───────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}



// ─── Waitlist ─────────────────────────────────────────────────────────────────

/**
 * Inserts a new lead into the waitlist table.
 * Returns success=true even for duplicates (to avoid email enumeration).
 */
export async function submitWaitlist(
  data: WaitlistFormData
): Promise<WaitlistSubmitResult> {
  if (!supabase) {
    console.warn("[Pantor] Supabase not configured — waitlist submission skipped.");
    return { success: true }; // graceful fallback for development
  }

  try {
    const { error } = await supabase.from("waitlist").insert({
      email: data.email.toLowerCase().trim(),
      role: data.role,
      company: data.company || null,
    });

    if (error) {
      // PostgreSQL unique violation code
      if (error.code === "23505") {
        return { success: true, isDuplicate: true };
      }
      console.error("[Pantor] Waitlist insert error:", error);
      return { success: false, error: "Erro ao salvar. Tente novamente." };
    }

    return { success: true };
  } catch (err) {
    console.error("[Pantor] Waitlist exception:", err);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function trackEvent(
  eventType: VisitorEventType,
  sessionId: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!supabase) return;

  try {
    await supabase.from("visitor_events").insert({
      event_type: eventType,
      session_id: sessionId,
      metadata: metadata ?? null,
    });
  } catch {
    // Non-critical — don't surface analytics errors to users
  }
}

// ─── Plan CTA Analytics ───────────────────────────────────────────────────────

/**
 * Tracks a click on a pricing plan CTA button.
 *
 * Delegates to trackEvent with structured plan metadata.
 * LGPD: planName is a product attribute (e.g. "Starter"), never a user attribute.
 * No PII is captured or inferred from this event.
 */
export async function trackPlanCtaClick(
  planName: string,
  sessionId: string | null
): Promise<void> {
  return trackEvent("cta_click", sessionId, {
    plan: planName,
    // source: "pricing_section" kept for future funnel segmentation
    source: "pricing_section",
  });
}

/**
 * Returns aggregated CTA click counts per plan (admin use only).
 * Calls the plan_cta_clicks_by_plan() RPC defined in schema.sql.
 */
export async function getPlanCtaClickStats(): Promise<
  { plan: string; clicks: number }[]
> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.rpc("plan_cta_clicks_by_plan");
    if (error) {
      console.error("[Pantor] plan_cta_clicks_by_plan error:", error);
      return [];
    }
    return (data ?? []).map((row: { plan: string; clicks: number }) => ({
      plan: row.plan,
      clicks: Number(row.clicks),
    }));
  } catch (err) {
    console.error("[Pantor] plan_cta_clicks_by_plan exception:", err);
    return [];
  }
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

export async function getAdminMetrics() {
  if (!supabase) return null;

  const [waitlistRes, visitorsRes, conversionsByDayRes, rolesRes, planClicksRes] =
    await Promise.allSettled([
      supabase.from("waitlist").select("id, role, created_at"),
      supabase.from("visitor_events").select("id, session_id, created_at").eq("event_type", "page_view"),
      supabase.rpc("conversions_by_day"),
      supabase.from("waitlist").select("role").not("role", "is", null),
      // Plan CTA interest heatmap — see plan_cta_clicks_by_plan() in schema.sql
      supabase.rpc("plan_cta_clicks_by_plan"),
    ]);

  const leads =
    waitlistRes.status === "fulfilled" ? waitlistRes.value.data ?? [] : [];
  const visitors =
    visitorsRes.status === "fulfilled" ? visitorsRes.value.data ?? [] : [];

  // Count unique session IDs for visitors
  const uniqueSessions = new Set(visitors.map((v) => v.session_id)).size;

  // Count roles
  const roleCounts: Record<string, number> = {};
  if (rolesRes.status === "fulfilled") {
    (rolesRes.value.data ?? []).forEach((r: { role: string }) => {
      roleCounts[r.role] = (roleCounts[r.role] ?? 0) + 1;
    });
  }

  const topRoles = Object.entries(roleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([role, count]) => ({ role, count }));

  // Plan CTA interest: which plan CTA attracted the most clicks
  const planCtaClicks: { plan: string; clicks: number }[] =
    planClicksRes.status === "fulfilled"
      ? (planClicksRes.value.data ?? []).map((row: { plan: string; clicks: number }) => ({
          plan: row.plan,
          clicks: Number(row.clicks),
        }))
      : [];

  const totalLeads = leads.length;
  const totalVisitors = Math.max(uniqueSessions, totalLeads);
  const conversionRate =
    totalVisitors > 0
      ? parseFloat(((totalLeads / totalVisitors) * 100).toFixed(1))
      : 0;

  // Group leads by day (last 30 days)
  const now = new Date();
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dayMap[d.toISOString().split("T")[0]] = 0;
  }
  leads.forEach((l: { created_at: string }) => {
    const day = l.created_at.split("T")[0];
    if (day in dayMap) dayMap[day]++;
  });

  const conversionsByDay = Object.entries(dayMap).map(([date, leadsCount]) => ({
    date,
    leads: leadsCount,
    visitors: 0,
  }));

  return {
    totalVisitors,
    totalLeads,
    conversionRate,
    conversionsByDay,
    topRoles,
    // Plan interest ranking: sorted by most CTA clicks — use in admin dashboard
    planCtaClicks,
  };
}
