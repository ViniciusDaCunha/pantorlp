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
  logIndex60dPerM: 3.50 * USD_TO_BRL,  // R$ 19.25 / million events (60 days)
} as const;

// ─── Plan feature type ────────────────────────────────────────────────────────

export interface PlanFeatures {
  seats: string;
  alerts: string;
  support: string;
}

// ─── Pantor Plans ─────────────────────────────────────────────────────────────

/**
 
 * Isso é intencionalmente menor volume que logs tradicionais — você não paga
 * por spans internos, só pelo que cruza a borda do seu produto.
 *
 
 */
export const PANTOR_PLANS: (PantorPlan & { features: PlanFeatures })[] = [
  {
    name: "Starter",
    price: 149,
    eventsM: 10,
    storageGB: 10,
    retentionDays: 14,
    defaultHosts: 1,
    badge: "Comece agora",
    features: {
      seats: "Ilimitados",
      alerts: "5 alertas",
      support: "E-mail",
    },
  },
  {
    name: "Growth",
    price: 499,
    eventsM: 50,
    storageGB: 50,
    retentionDays: 30,
    defaultHosts: 3,
    highlighted: true,
    badge: "Mais popular",
    features: {
      seats: "Ilimitados",
      alerts: "Ilimitados",
      support: "E-mail prioritário",
    },
  },
  {
    name: "Business",
    price: 1199,
    eventsM: 200,
    storageGB: 200,
    retentionDays: 60,
    defaultHosts: 10,
    features: {
      seats: "Ilimitados",
      alerts: "Ilimitados",
      support: "Slack dedicado",
    },
  },
];

export const ENTERPRISE_PLAN = {
  name: "Enterprise",
  isEnterprise: true as const,
  features: {
    seats: "Ilimitados",
    alerts: "Ilimitados",
    support: "SLA & suporte dedicado",
  },
  perks: [
    "Volume customizado",
    "Retenção negociável",
    "SSO / SAML",
    "SLA garantido",
    "Onboarding dedicado",
    "Contratos anuais",
  ],
};

// ─── Competitor calculation ───────────────────────────────────────────────────

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
      : retentionDays <= 30
        ? COMPETITOR.logIndex30dPerM
        : COMPETITOR.logIndex60dPerM;
  const indexing = eventsM * indexRate;

  return Math.round(infra + apm + ingest + indexing);
}

export function getPlanComparison(plan: PantorPlan & { features?: PlanFeatures }): PricingComparison {
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

// ─── Event Estimator ──────────────────────────────────────────────────────────

/**
 * Core insight: 1 evento Pantor = 1 request HTTP da sua aplicação.
 * Diferente de stacks tradicionais que cobram por log line ou span interno,
 * o Pantor cobra apenas pelo evento que cruza a borda do produto.
 */

export interface EventEstimate {
  requestsPerDay: number;
  eventsPerMonth: number;
  eventsM: number;
  recommendedPlan: (PantorPlan & { features: PlanFeatures }) | null;
  isAboveMaxPlan: boolean;
  contextLabel: string;
}

/**
 * Estima o plano necessário a partir de DAUs e requests médios por usuário/dia.
 *
 * Referência:
 *   10M eventos/mês = ~333K requests/dia = produto com 3k–10k DAUs × 30–100 req/dia
 */
export function estimateFromDAU(dau: number, requestsPerUserPerDay: number): EventEstimate {
  const requestsPerDay = dau * requestsPerUserPerDay;
  const eventsPerMonth = requestsPerDay * 30;
  const eventsM = eventsPerMonth / 1_000_000;

  const maxPlan = PANTOR_PLANS[PANTOR_PLANS.length - 1];
  const isAboveMaxPlan = eventsM > maxPlan.eventsM;
  const recommendedPlan = PANTOR_PLANS.find((p) => p.eventsM >= eventsM) ?? null;

  // Human-readable context
  let contextLabel = "";
  if (eventsM < 1) {
    contextLabel = `${Math.round(eventsPerMonth / 1000)}K eventos/mês`;
  } else {
    contextLabel = `${eventsM.toFixed(1)}M eventos/mês`;
  }

  return {
    requestsPerDay,
    eventsPerMonth,
    eventsM,
    recommendedPlan,
    isAboveMaxPlan,
    contextLabel,
  };
}

/**
 * Estima o plano a partir de requests/mês diretos.
 */
export function estimateFromRequestsPerMonth(requestsPerMonth: number): EventEstimate {
  // 1 evento = 1 request, então eventsPerMonth = requestsPerMonth
  const eventsPerMonth = requestsPerMonth;
  const eventsM = eventsPerMonth / 1_000_000;
  const requestsPerDay = Math.round(requestsPerMonth / 30);

  const maxPlan = PANTOR_PLANS[PANTOR_PLANS.length - 1];
  const isAboveMaxPlan = eventsM > maxPlan.eventsM;
  const recommendedPlan = PANTOR_PLANS.find((p) => p.eventsM >= eventsM) ?? null;

  let contextLabel = "";
  if (eventsM < 1) {
    contextLabel = `${Math.round(eventsPerMonth / 1000)}K eventos/mês`;
  } else {
    contextLabel = `${eventsM.toFixed(1)}M eventos/mês`;
  }

  return {
    requestsPerDay,
    eventsPerMonth,
    eventsM,
    recommendedPlan,
    isAboveMaxPlan,
    contextLabel,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatEvents(eventsM: number): string {
  if (eventsM >= 1) return `${eventsM}M`;
  return `${eventsM * 1000}K`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}