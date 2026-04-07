"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Icon } from "@/components/atoms/Icon/Icon";
import { PANTOR_PLANS, getPlanComparison, formatBRL, formatEvents, calculateInteractiveSavings } from "@/utils/pricing";
import type { PantorPlan } from "@/types";
import styles from "./PricingCalculator.module.css";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan }: { plan: PantorPlan }) {
  const comparison = useMemo(() => getPlanComparison(plan), [plan]);

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

      {/* Usage */}
      <div className={styles.planUsage}>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Eventos</span>
          <span className={styles.planUsageValue}>{formatEvents(plan.eventsM)} / mês</span>
        </div>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Armazenamento</span>
          <span className={styles.planUsageValue}>{plan.storageGB} GB</span>
        </div>
        <div className={styles.planUsageRow}>
          <span className={styles.planUsageLabel}>Retenção</span>
          <span className={styles.planUsageValue}>{plan.retentionDays} dias</span>
        </div>
      </div>

      {/* Retention bar */}
      <div className={styles.retentionBar} aria-label={`Retenção: ${plan.retentionDays} de 30 dias`}>
        <div className={styles.retentionBarLabel}>
          <span>Retenção</span>
          <span>{plan.retentionDays} dias</span>
        </div>
        <div className={styles.retentionBarTrack}>
          <div
            className={styles.retentionBarFill}
            style={{ width: `${(plan.retentionDays / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Savings comparison */}
      <div className={styles.savingsBlock}>
        <div className={styles.savingsHeader}>Vs. ferramentas enterprise equivalentes</div>
        <div className={styles.savingsComparison}>
          <div className={styles.savingsItem}>
            <span className={styles.savingsItemLabel}>Pantor</span>
            <span className={[styles.savingsItemValue, styles.savingsPantor].join(" ")}>
              {formatBRL(comparison.pantorPrice)}
            </span>
          </div>
          <div className={styles.savingsVs}>vs</div>
          <div className={styles.savingsItem}>
            <span className={styles.savingsItemLabel}>Ferramentas enterprise</span>
            <span className={[styles.savingsItemValue, styles.savingsCompetitor].join(" ")}>
              {formatBRL(comparison.competitorPrice)}
            </span>
          </div>
        </div>
        <div className={styles.savingsBadge} aria-label={`Economia de ${comparison.savingsPercent}%`}>
          <Icon name="money" className={styles.savingsBadgeIcon} title="Economia" />
          Você economiza <strong>{comparison.savingsPercent}%</strong> —{" "}
          <strong>{formatBRL(comparison.savingsBRL)}</strong>/mês
        </div>
      </div>

      <Button
        variant={plan.highlighted ? "primary" : "secondary"}
        size="md"
        onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
        aria-label={`Entrar na waitlist para o plano ${plan.name}`}
      >
        Quero o plano {plan.name}
      </Button>
    </article>
  );
}

// ─── Interactive Calculator ───────────────────────────────────────────────────
function InteractiveCalculator() {
  const [eventsPerMonth, setEventsPerMonth] = useState(1_000_000);
  const [hosts, setHosts] = useState(2);

  const result = useMemo(
    () => calculateInteractiveSavings(eventsPerMonth, hosts),
    [eventsPerMonth, hosts]
  );

  const eventsLabel = eventsPerMonth >= 1_000_000
    ? `${(eventsPerMonth / 1_000_000).toFixed(1)}M`
    : `${(eventsPerMonth / 1_000).toFixed(0)}K`;

  return (
    <div className={styles.calculator}>
      <div className={styles.calculatorHeader}>
        <h3 className={styles.calculatorTitle}>Calculadora de Economia</h3>
        <p className={styles.calculatorSubtitle}>Arraste os sliders e veja quanto você economiza</p>
      </div>

      <div className={styles.calculatorControls}>
        {/* Events slider */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="events-slider">
            Eventos por mês
            <span className={styles.sliderValue}>{eventsLabel}</span>
          </label>
          <input
            id="events-slider"
            type="range"
            min={100_000}
            max={50_000_000}
            step={100_000}
            value={eventsPerMonth}
            onChange={(e) => setEventsPerMonth(Number(e.target.value))}
            className={styles.slider}
            aria-valuetext={eventsLabel}
          />
          <div className={styles.sliderRange}>
            <span>100K</span>
            <span>50M</span>
          </div>
        </div>

        {/* Hosts slider */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="hosts-slider">
            Hosts / Instâncias
            <span className={styles.sliderValue}>{hosts}</span>
          </label>
          <input
            id="hosts-slider"
            type="range"
            min={1}
            max={20}
            step={1}
            value={hosts}
            onChange={(e) => setHosts(Number(e.target.value))}
            className={styles.slider}
            aria-valuetext={String(hosts)}
          />
          <div className={styles.sliderRange}>
            <span>1</span>
            <span>20</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={styles.calculatorResult}>
        <div className={styles.calculatorResultItem}>
          <span className={styles.resultLabel}>Com o Pantor</span>
          <span className={[styles.resultValue, styles.resultPantor].join(" ")}>
            {formatBRL(result.pantorPrice)}<span className={styles.resultPeriod}>/mês</span>
          </span>
          <span className={styles.resultPlanTag}>Plano {result.recommendedPlan.name}</span>
        </div>
        <div className={styles.calculatorResultDivider} aria-hidden="true" />
        <div className={styles.calculatorResultItem}>
          <span className={styles.resultLabel}>Ferramentas enterprise</span>
          <span className={[styles.resultValue, styles.resultCompetitor].join(" ")}>
            {formatBRL(result.competitorPrice)}<span className={styles.resultPeriod}>/mês</span>
          </span>
          <span className={styles.resultPlanTag}>Infra + APM + Logs</span>
        </div>
        <div className={styles.calculatorResultDivider} aria-hidden="true" />
        <div className={styles.calculatorResultItem}>
          <span className={styles.resultLabel}>Sua economia</span>
          <span className={[styles.resultValue, styles.resultSavings].join(" ")}>
            {result.savingsPercent}%<span className={styles.resultPeriod}> menor</span>
          </span>
          <span className={styles.resultPlanTag}>por mês</span>
        </div>
      </div>

      <p className={styles.calculatorDisclaimer}>
        * Estimativa baseada em custos médios de mercado para stack completa de observabilidade (infra + APM + logs).
        USD considerado a R$ 5,50.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PricingCalculator() {
  const ref = useIntersectionObserver('visible');
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
            Veja quanto você economiza em comparação com ferramentas enterprise.
          </p>
        </div>

        {/* Plans */}
        <div className={styles.plansGrid}>
          {PANTOR_PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

       

        {/* Features included */}
        <div className={styles.includedFeatures}>
          <div className={styles.includedTitle}>Todos os planos incluem</div>
          <div className={styles.includedGrid}>
            {[
              "Wide events ilimitados por request",
              "SDK JS/TS + OTLP nativo",
              "Query language contextual",
              "Alertas básicos configuráveis",
              "Sem taxa de ingestion extra",
              "Suporte por e-mail",
            ].map((feature) => (
              <div key={feature} className={styles.includedItem}>
                <span className={styles.includedCheck} aria-hidden="true">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
