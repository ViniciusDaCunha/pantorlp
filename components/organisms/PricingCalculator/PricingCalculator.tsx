"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Icon } from "@/components/atoms/Icon/Icon";
import {
  PANTOR_PLANS,
  ENTERPRISE_PLAN,
  getPlanComparison,
  estimateFromDAU,
  formatBRL,
  formatEvents,
  formatNumber,
} from "@/utils/pricing";
import type { PantorPlan } from "@/types";
import type { PlanFeatures } from "@/utils/pricing";
import styles from "./PricingCalculator.module.css";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { trackPlanCtaClick } from "@/lib/supabase";
import { useRef } from "react";

// ─── Session ID (client-only, no PII) ────────────────────────────────────────
// Reads from sessionStorage so that a single visitor's multi-click journey
// is correlated without identifying them — compatible with LGPD Art.5.
function useSessionId(): string | null {
  const ref = useRef<string | null>(null);
  if (typeof window !== "undefined" && !ref.current) {
    let id = sessionStorage.getItem("pantor_session_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("pantor_session_id", id);
    }
    ref.current = id;
  }
  return ref.current;
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan }: { plan: PantorPlan & { features: PlanFeatures } }) {
  const comparison = useMemo(() => getPlanComparison(plan), [plan]);
  const sessionId = useSessionId();

  function handleCtaClick(): void {
    // Fire-and-forget: non-critical analytics must never block navigation
    void trackPlanCtaClick(plan.name, sessionId);
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <article className={[styles.planCard, plan.highlighted ? styles.planHighlighted : ""].join(" ")}>
      {plan.badge && <div className={styles.planBadge}>{plan.badge}</div>}

      <div className={styles.planHeader}>
        <h3 className={styles.planName}>{plan.name}</h3>
        <div className={styles.planPrice}>
          <span className={styles.planPriceCurrency}>R$</span>
          <span className={styles.planPriceValue}>{plan.price.toLocaleString("pt-BR")}</span>
          <span className={styles.planPricePeriod}>/mês</span>
        </div>
      </div>

      {/* Usage limits */}
      <div className={styles.planUsage}>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Eventos / mês</span>
          <span className={styles.planUsageValue}>{formatEvents(plan.eventsM)}</span>
        </div>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Retenção</span>
          <span className={styles.planUsageValue}>{plan.retentionDays} dias</span>
        </div>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Seats</span>
          <span className={styles.planUsageValue}>{plan.features.seats}</span>
        </div>
      </div>

      {/* Retention bar */}
      <div className={styles.retentionBar} aria-label={`Retenção: ${plan.retentionDays} de 60 dias`}>
        <div className={styles.retentionBarLabel}>
          <span>Retenção de dados</span>
          <span>{plan.retentionDays} dias</span>
        </div>
        <div className={styles.retentionBarTrack}>
          <div
            className={styles.retentionBarFill}
            style={{ width: `${(plan.retentionDays / 60) * 100}%` }}
          />
        </div>
      </div>

      {/* Included features */}
      <div className={styles.planFeatures}>
        <div className={styles.planFeatureItem}>
          <Icon name="check" />
          <span>{plan.features.alerts}</span>
        </div>
        <div className={styles.planFeatureItem}>
          <Icon name="check" />
          <span>Suporte: {plan.features.support}</span>
        </div>
        <div className={styles.planFeatureItem}>
          <Icon name="check" />
          <span>SDK JS/TS + OTLP nativo</span>
        </div>
        
      </div>

      

      <Button
        variant={plan.highlighted ? "primary" : "secondary"}
        size="md"
        onClick={handleCtaClick}
        aria-label={`Entrar na waitlist para o plano ${plan.name}`}
      >
        Quero o plano {plan.name}
      </Button>
    </article>
  );
}

// ─── Enterprise Card ──────────────────────────────────────────────────────────
function EnterpriseCard() {
  const sessionId = useSessionId();

  function handleCtaClick(): void {
    // "Enterprise" is used as the plan name to match plan_cta_clicks_by_plan() grouping
    void trackPlanCtaClick("Enterprise", sessionId);
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <article className={[styles.planCard, styles.planEnterprise].join(" ")}>
      <div className={styles.planHeader}>
        <h3 className={styles.planName}>{ENTERPRISE_PLAN.name}</h3>
        <div className={styles.planPriceCustom}>
          <span className={styles.planPriceCustomLabel}>Sob consulta</span>
          <span className={styles.planPriceCustomSub}>Volume e retenção personalizados</span>
        </div>
      </div>

      <div className={styles.planUsage}>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Eventos / mês</span>
          <span className={styles.planUsageValue}>Customizado</span>
        </div>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Retenção</span>
          <span className={styles.planUsageValue}>Negociável</span>
        </div>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Seats</span>
          <span className={styles.planUsageValue}>Ilimitados</span>
        </div>
      </div>

      <div className={styles.planFeatures}>
        {ENTERPRISE_PLAN.perks.map((perk) => (
          <div key={perk} className={styles.planFeatureItem}>
            <Icon name="check" />
            <span>{perk}</span>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        size="md"
        onClick={handleCtaClick}
        aria-label="Falar com time de vendas sobre Enterprise"
      >
        Falar com vendas
      </Button>
    </article>
  );
}

// ─── Event Estimator ──────────────────────────────────────────────────────────
function EventEstimator() {
  const [dau, setDau] = useState(5_000);
  const [reqPerUser, setReqPerUser] = useState(50);

  const estimate = useMemo(() => estimateFromDAU(dau, reqPerUser), [dau, reqPerUser]);

  const dauLabel = dau >= 1_000 ? `${(dau / 1_000).toFixed(0)}K` : String(dau);
  const reqPerDayLabel = formatNumber(estimate.requestsPerDay);

  const planColor = (planName: string) => {
    if (planName === "Starter") return "var(--color-success)";
    if (planName === "Growth") return "var(--color-brand)";
    if (planName === "Business") return "var(--color-warning, #f59e0b)";
    return "var(--color-brand)";
  };

  return (
    <div className={styles.estimator}>
      {/* Header with key concept */}
      <div className={styles.estimatorHeader}>
        
        <h3 className={styles.estimatorTitle}>Qual plano você precisa?</h3>
        <p className={styles.estimatorSubtitle}>
          Na Pantor, cada evento corresponde a <strong>1 request HTTP</strong> da sua aplicação.
          Isso é intencionalmente menos volume do que logs
          tradicionais. Ajuste os sliders para descobrir seu plano ideal.
        </p>
      </div>

      {/* Reference scale */}
      <div className={styles.estimatorScale}>
        
        <div className={styles.estimatorScaleTitle}>Referência de escala</div>
        <div className={styles.estimatorScaleGrid}>
          <div className={styles.estimatorScaleItem}>
            <span className={styles.estimatorScaleEvents}>10M</span>
            <span className={styles.estimatorScaleDesc}>eventos/mês</span>
            <span className={styles.estimatorScaleSep}>≈</span>
            <span className={styles.estimatorScaleReq}>333K req/dia</span>
            <span className={styles.estimatorScaleDau}>3K–10K DAUs × 30–100 req</span>
          </div>
          <div className={styles.estimatorScaleItem}>
            <span className={styles.estimatorScaleEvents}>50M</span>
            <span className={styles.estimatorScaleDesc}>eventos/mês</span>
            <span className={styles.estimatorScaleSep}>≈</span>
            <span className={styles.estimatorScaleReq}>1,6M req/dia</span>
            <span className={styles.estimatorScaleDau}>50K–100K DAUs</span>
          </div>
          <div className={styles.estimatorScaleItem}>
            <span className={styles.estimatorScaleEvents}>200M</span>
            <span className={styles.estimatorScaleDesc}>eventos/mês</span>
            <span className={styles.estimatorScaleSep}>≈</span>
            <span className={styles.estimatorScaleReq}>6,6M req/dia</span>
            <span className={styles.estimatorScaleDau}>200K+ DAUs</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className={styles.estimatorControls}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="dau-slider">
            Usuários ativos por dia (DAU)
            <span className={styles.sliderValue}>{dauLabel}</span>
          </label>
          <input
            id="dau-slider"
            type="range"
            min={100}
            max={500_000}
            step={500}
            value={dau}
            onChange={(e) => setDau(Number(e.target.value))}
            className={styles.slider}
            aria-valuetext={dauLabel}
          />
          <div className={styles.sliderRange}>
            <span>100</span>
            <span>500K</span>
          </div>
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="req-slider">
            Requests médios por usuário / dia
            <span className={styles.sliderValue}>{reqPerUser}</span>
          </label>
          <input
            id="req-slider"
            type="range"
            min={5}
            max={200}
            step={5}
            value={reqPerUser}
            onChange={(e) => setReqPerUser(Number(e.target.value))}
            className={styles.slider}
            aria-valuetext={String(reqPerUser)}
          />
          <div className={styles.sliderRange}>
            <span>5</span>
            <span>200</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={styles.estimatorResult}>
        <div className={styles.estimatorResultFlow}>
          <div className={styles.estimatorResultStep}>
            <div className={styles.estimatorResultStepLabel}>Requests / dia</div>
            <div className={styles.estimatorResultStepValue}>{reqPerDayLabel}</div>
          </div>
          <div className={styles.estimatorResultArrow}>×30 dias</div>
          <div className={styles.estimatorResultStep}>
            <div className={styles.estimatorResultStepLabel}>Eventos / mês</div>
            <div className={styles.estimatorResultStepValue}>{estimate.contextLabel}</div>
          </div>
          <div className={styles.estimatorResultArrow}>→</div>
          <div className={styles.estimatorResultPlan}>
            <div className={styles.estimatorResultPlanLabel}>Plano recomendado</div>
            {estimate.isAboveMaxPlan ? (
              <div className={styles.estimatorResultPlanName} style={{ color: "var(--color-brand)" }}>
                Enterprise
                <span className={styles.estimatorResultPlanSub}>Fale com vendas</span>
              </div>
            ) : estimate.recommendedPlan ? (
              <div
                className={styles.estimatorResultPlanName}
                style={{ color: planColor(estimate.recommendedPlan.name) }}
              >
                {estimate.recommendedPlan.name}
                <span className={styles.estimatorResultPlanSub}>
                  {formatBRL(estimate.recommendedPlan.price)}/mês
                </span>
              </div>
            ) : (
              <div className={styles.estimatorResultPlanName}>—</div>
            )}
          </div>
        </div>

        {!estimate.isAboveMaxPlan && estimate.recommendedPlan && (
          <div className={styles.estimatorResultNote}>
             Com <strong>{estimate.contextLabel}</strong>, o plano{" "}
            <strong>{estimate.recommendedPlan.name}</strong> cobre até{" "}
            <strong>{formatEvents(estimate.recommendedPlan.eventsM)} eventos/mês</strong>.{" "}
            Se sua estimativa for conservadora, comece aqui e escale sem surpresa na fatura.
          </div>
        )}

        {estimate.isAboveMaxPlan && (
          <div className={styles.estimatorResultNote}>
            💡 Você está acima do Business. Fale com nosso time para volume customizado, SLA e retenção extendida.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PricingCalculator() {
  const ref = useIntersectionObserver("visible");
  return (
    <section ref={ref} id="pricing" className={styles.section} aria-labelledby="pricing-heading">
      <div className={["content-container", "section-padding"].join(" ")}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Preços</span>
          <h2 id="pricing-heading" className={styles.sectionTitle}>
            Custo previsível. Sem surpresa na fatura.
          </h2>
          <p className={styles.sectionSubtitle}>
            Nunca uma surpresa no final do mês. Alertas proativos antes de atingir o limite.
            E o melhor: <strong>1 evento = 1 request</strong> — você paga apenas pelo que sua aplicação
            realmente processa, não por log lines ou spans internos.
          </p>
        </div>

        {/* Event Estimator — above plans so users arrive informed */}
        <EventEstimator />

        {/* Plans */}
        <div className={styles.plansGrid}>
          {PANTOR_PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
          <EnterpriseCard />
        </div>

        
      </div>
    </section>
  );
}
