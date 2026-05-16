import React from "react";
import styles from "./SolutionsSection.module.css";
import { Icon, type IconName } from "@/components/atoms/Icon/Icon";

const SOLUTIONS: Array<{ icon: IconName; color: string; title: string; description: string; codeExample: string }> = [
  {
    icon: "bolt",
    color: "brand",
    title: "Um evento rico substitui tudo",
    description: "Wide events capturam contexto de negócio, performance e ambiente em um único evento estruturado. Métricas e traces são derivados dinamicamente na consulta — sem pré-agregação.",
    codeExample: `pantor.event({
  type: "payment.failed",
  user_id: "usr_abc123",
  amount: 150.00,
  error: "INSUFFICIENT_FUNDS",
  duration_ms: 1847,
  trace_id: "5d8e4f2a..."
})`,
  },
  {
    icon: "search",
    color: "brand",
    title: "Encontre qualquer coisa em 3 queries",
    description: "Query language natural e intuitiva: encontre a causa raiz de qualquer erro com até 3 buscas. Sem precisar de especialista em infra.",
    codeExample: `// Buscar por contexto rico
user:alice status:500 duration:>2000

// Filtrar por domínio de negócio  
type:payment.failed amount:>100 region:BR

// Correlacionar com trace
trace_id:5d8e4f2a...`,
  },
  {
    icon: "clock",
    color: "brand",
    title: "Setup em menos de 15 minutos",
    description: "Uma linha de código e você começa. SDK com batching automático, retry com backoff e fila local. Eventos não se perdem mesmo com rede instável.",
    codeExample: `npm install @pantor/sdk

import { pantor } from '@pantor/sdk'
pantor.init({ apiKey: 'pk_live_...' })

// Pronto. Você já tem observabilidade.`,
  },
  {
    icon: "folder",
    color: "brand",
    title: "OpenTelemetry nativo — sem reescrever nada",
    description: "Já usa OTLP? Aponte seu Collector existente para o endpoint do Pantor. Zero reescrita de instrumentação. Compatível com o ecossistema OTel completo.",
    codeExample: `# Collector config (sem mudar instrumentação)
exporters:
  otlphttp:
    endpoint: https://ingest.pantor.dev
    headers:
      Authorization: Bearer pk_live_...`,
  },
];

const LOOP_STEPS: Array<{ step: string; icon: IconName; description: string }> = [
  { step: "Deploy", icon: "cloud", description: "Você faz um deploy" },
  { step: "Captura", icon: "capture", description: "Pantor captura wide events" },
  { step: "Consulta", icon: "search", description: "Você busca e analisa" },
  { step: "Valida", icon: "check", description: "Valida o comportamento real" },
  { step: "Itera", icon: "sync", description: "Itera com confiança" },

  
];

export function SolutionsSection() {
  return (
    <section id="solutions" className={styles.section} aria-labelledby="solutions-heading">
      <div className={[styles.sectionBg, "grid-bg"].join(" ")} aria-hidden="true" />

      <div className={["content-container", "section-padding"].join(" ")}>
        {/* Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>A Solução</span>
          <h2 id="solutions-heading" className={styles.sectionTitle}>
            Fechando o loop entre dev e produção
          </h2>
          <p className={styles.sectionSubtitle}>
            O Pantor torna produção parte ativa do fluxo de desenvolvimento —
            não um destino de emergência.
          </p>
        </div>

        {/* Dev loop visual */}
        <div className={styles.loopVisual} aria-label="Ciclo de desenvolvimento contínuo">
          <div className={styles.loopTitle}>O loop que o Pantor habilita</div>
          <div className={styles.loopSteps}>
            {LOOP_STEPS.map((item, idx) => (
              <React.Fragment key={item.step}>
                <div className={styles.loopStep}>
                  <Icon name={item.icon} className={styles.loopStepIcon} title={item.step} />
                  <span className={styles.loopStepLabel}>{item.step}</span>
                  <span className={styles.loopStepDesc}>{item.description}</span>
                </div>
                {idx < LOOP_STEPS.length - 1 && (
                  <span className={styles.loopArrow} aria-hidden="true">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Solution cards */}
        <div className={styles.solutionsGrid}>
          {SOLUTIONS.map((sol) => (
            <article key={sol.title} className={[styles.solutionCard, styles[`accent_${sol.color}`]].join(" ")}>
              <div className={styles.solutionCardHeader}>
                <Icon name={sol.icon} className={styles.solutionCardIcon} title={sol.title} />
                <h3 className={styles.solutionCardTitle}>{sol.title}</h3>
              </div>
              <p className={styles.solutionCardDescription}>{sol.description}</p>
              <pre className={styles.solutionCodeBlock} aria-label={`Exemplo de código: ${sol.title}`}>
                <code>{sol.codeExample}</code>
              </pre>
            </article>
          ))}
        </div>

        {/* Quote */}
        <figure className={styles.quoteBlock}>
          
          <blockquote className={styles.quote}> 
            O código descreve a intenção. A telemetria descreve a realidade.
            Pantor é a ponte entre os dois.
          </blockquote>
          
        </figure>
      </div>
    </section>
  );
}
