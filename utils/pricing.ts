import type { PantorPlan, PricingComparison } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const USD_TO_BRL = 5.50;

/**
 * Competitor pricing structure (anonymous "Ferramenta Enterprise").
 * Based on publicly available market rates for full observability stack
 * (infrastructure + APM + log management combined).
 */
export const COMPETITOR = {
  infraPerHost: 15 * USD_TO_BRL,       // R$ 82.50 / host
  apmPerHost: 31 * USD_TO_BRL,         // R$ 170.50 / host (APM tracing)
  logIngestPerGB: 0.10 * USD_TO_BRL,   // R$ 0.55 / GB
  logIndex15dPerM: 1.70 * USD_TO_BRL,  // R$ 9.35 / million events (15 days)
  logIndex30dPerM: 2.50 * USD_TO_BRL,  // R$ 13.75 / million events (30 days)
} as const;

// ─── Pantor Plans ─────────────────────────────────────────────────────────────

export const PANTOR_PLANS: PantorPlan[] = [
  {
    name: "Starter",
    price: 75,
    eventsM: 0.5,
    storageGB: 0.5,
    retentionDays: 7,
    defaultHosts: 1,
    badge: "Comece agora",
  },
  {
    name: "Growth",
    price: 290,
    eventsM: 5,
    storageGB: 5,
    retentionDays: 15,
    defaultHosts: 2,
    highlighted: true,
    badge: "Mais popular",
  },
  {
    name: "Business",
    price: 990,
    eventsM: 50,
    storageGB: 50,
    retentionDays: 30,
    defaultHosts: 3,
  },
];

// ─── Calculation ──────────────────────────────────────────────────────────────

/**
 * Calculates the equivalent cost on a traditional enterprise observability stack
 * (infra monitoring + APM/tracing + log management) for the same usage.
 *
 * @param hosts     - Number of application hosts
 * @param eventsM   - Events per month in millions
 * @param storageGB - Estimated log storage in GB
 * @param retentionDays - Retention period in days
 */
export function calculateCompetitorCost(
  hosts: number,
  eventsM: number,
  storageGB: number,
  retentionDays: number
): number {
  const infra = hosts * COMPETITOR.infraPerHost;
  const apm = hosts * COMPETITOR.apmPerHost;
  const ingest = storageGB * COMPETITOR.logIngestPerGB;
  const indexRate =
    retentionDays <= 15
      ? COMPETITOR.logIndex15dPerM
      : COMPETITOR.logIndex30dPerM;
  const indexing = eventsM * indexRate;

  return Math.round(infra + apm + ingest + indexing);
}

/**
 * Returns the full pricing comparison for a given Pantor plan.
 */
export function getPlanComparison(plan: PantorPlan): PricingComparison {
  const competitorPrice = calculateCompetitorCost(
    plan.defaultHosts,
    plan.eventsM,
    plan.storageGB,
    plan.retentionDays
  );
  const savingsBRL = competitorPrice - plan.price;
  const savingsPercent = Math.round((savingsBRL / competitorPrice) * 100);

  return {
    pantorPrice: plan.price,
    competitorPrice,
    savingsBRL,
    savingsPercent,
  };
}

/**
 * Interactive calculator — estimates cost for arbitrary usage.
 */
export function calculateInteractiveSavings(
  eventsPerMonth: number,
  hosts: number
): {
  pantorPrice: number;
  competitorPrice: number;
  savingsPercent: number;
  recommendedPlan: PantorPlan;
} {
  const eventsM = eventsPerMonth / 1_000_000;
  const storageGB = eventsM; // ~1 GB per million events

  // Find recommended Pantor plan
  const recommendedPlan =
    PANTOR_PLANS.find((p) => p.eventsM >= eventsM) ??
    PANTOR_PLANS[PANTOR_PLANS.length - 1];

  const competitorPrice = calculateCompetitorCost(
    hosts,
    eventsM,
    storageGB,
    recommendedPlan.retentionDays
  );

  const pantorPrice = recommendedPlan.price;
  const savingsPercent = Math.round(
    ((competitorPrice - pantorPrice) / competitorPrice) * 100
  );

  return { pantorPrice, competitorPrice, savingsPercent, recommendedPlan };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatEvents(eventsM: number): string {
  if (eventsM >= 1) return `${eventsM}M`;
  return `${eventsM * 1000}K`;
}
