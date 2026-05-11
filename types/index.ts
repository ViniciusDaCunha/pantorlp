// ─── Waitlist ───────────────────────────────────────────────────────────────

export type DeveloperRole = "developer" | "tech-lead" | "cto" | "founder" | "other";

export interface WaitlistEntry {
  id: string;
  email: string;
  role: DeveloperRole;
  company: string | null;
  created_at: string;
}

export interface WaitlistFormData {
  email: string;
  role: DeveloperRole;
  company: string;
}

export interface WaitlistSubmitResult {
  success: boolean;
  error?: string;
  isDuplicate?: boolean;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export type VisitorEventType = "page_view" | "cta_click" | "form_start" | "form_submit";

export interface VisitorEvent {
  id: string;
  event_type: VisitorEventType;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminMetrics {
  totalVisitors: number;
  totalLeads: number;
  conversionRate: number;
  conversionsByDay: Array<{ date: string; leads: number; visitors: number }>;
  topRoles: Array<{ role: string; count: number }>;
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

export type EventLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface TerminalEvent {
  timestamp: string;
  level: EventLevel;
  eventType: string;
  attrs: string;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface PantorPlan {
  name: string;
  price: number;
  eventsM: number;   // millions
  retentionDays: number;
  highlighted?: boolean;
  badge?: string;
  custom?: boolean; // for enterprise
  storageGB: number;
  defaultHosts: number;
}

export interface PlanFeatures {
  seats: string;
  alerts: string;
  support: string;
}

export interface PricingComparison {
  pantorPrice: number;
  competitorPrice: number;
  savingsPercent: number;
  savingsBRL: number;
}
