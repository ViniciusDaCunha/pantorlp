import { createClient } from "@supabase/supabase-js";
import type { WaitlistFormData, WaitlistSubmitResult, VisitorEventType } from "@/types";

// ─── Client ───────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

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

// ─── Admin Queries ────────────────────────────────────────────────────────────

export async function getAdminMetrics() {
  if (!supabase) return null;

  const [waitlistRes, visitorsRes, conversionsByDayRes, rolesRes] =
    await Promise.allSettled([
      supabase.from("waitlist").select("id, role, created_at"),
      supabase.from("visitor_events").select("id, session_id, created_at").eq("event_type", "page_view"),
      supabase.rpc("conversions_by_day"),
      supabase.from("waitlist").select("role").not("role", "is", null),
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
  };
}
