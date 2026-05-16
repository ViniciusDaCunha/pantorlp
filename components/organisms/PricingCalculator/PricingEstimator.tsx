"use client";

import { useMemo, useState } from "react";
import {
  estimateFromDAU,
  formatBRL,
  formatNumber,
  formatEvents,
} from "@/utils/pricing";
import styles from "./PricingCalculator.module.css";

export function PricingEstimator() {
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
      <div className={styles.estimatorHeader}>
        <h3 className={styles.estimatorTitle}>Qual plano você precisa?</h3>
        <p className={styles.estimatorSubtitle}>
          Na Pantor, cada evento corresponde a <strong>1 request HTTP</strong> da sua aplicação.
          Isso é intencionalmente menos volume do que logs tradicionais. Ajuste os sliders para
          descobrir seu plano ideal.
        </p>
      </div>

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
              <div className={styles.estimatorResultPlanName}>-</div>
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
            Você está acima do Business. Fale com nosso time para volume customizado, SLA e
            retenção extendida.
          </div>
        )}
      </div>
    </div>
  );
}
