import { Icon } from "@/components/atoms/Icon/Icon";
import {
  ENTERPRISE_PLAN,
  PANTOR_PLANS,
  formatEvents,
} from "@/utils/pricing";
import type { PantorPlan } from "@/types";
import type { PlanFeatures } from "@/utils/pricing";
import styles from "./PricingCalculator.module.css";
import { PricingEstimator } from "./PricingEstimator";
import { PlanCtaButton } from "./PlanCtaButton";

function PlanCard({ plan }: { plan: PantorPlan & { features: PlanFeatures } }) {
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

      <PlanCtaButton
        planName={plan.name}
        highlighted={plan.highlighted}
        ariaLabel={`Entrar na waitlist para o plano ${plan.name}`}
      >
        Quero o plano {plan.name}
      </PlanCtaButton>
    </article>
  );
}

function EnterpriseCard() {
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

      <PlanCtaButton
        planName="Enterprise"
        ariaLabel="Falar com time de vendas sobre Enterprise"
      >
        Falar com vendas
      </PlanCtaButton>
    </article>
  );
}

export function PricingCalculator() {
  return (
    <section id="pricing" className={styles.section} aria-labelledby="pricing-heading">
      <div className={["content-container", "section-padding"].join(" ")}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Preços</span>
          <h2 id="pricing-heading" className={styles.sectionTitle}>
            Custo previsível. Sem surpresa na fatura.
          </h2>
          <p className={styles.sectionSubtitle}>
            Nunca uma surpresa no final do mês. Alertas proativos antes de atingir o limite.
            E o melhor: <strong>1 evento = 1 request</strong> - você paga apenas pelo que sua aplicação
            realmente processa, não por log lines ou spans internos.
          </p>
        </div>

        <PricingEstimator />

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
