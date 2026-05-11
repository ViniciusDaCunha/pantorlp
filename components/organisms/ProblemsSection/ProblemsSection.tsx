"use client";
import React from "react";
import styles from "./ProblemsSection.module.css";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Icon } from "@/components/atoms/Icon/Icon";
import {IconName} from "@/components/atoms/Icon/Icon";

interface Problem {
  icon: IconName;
  title: string;
  description: string;
  pain: string;
} 


const PROBLEMS: Problem[] = [

   {
    icon: "money",
    title: "Custo imprevisível e crescente",
    description: "Plataformas enterprise cobram por volume de dados sem transparência. A fatura chega no fim do mês e surpreende — para cima. Times pequenos ficam sem visibilidade por falta de orçamento.",
    pain: "Fatura surpresa todo mês",
  },
  {
    icon: "folder",
    title: "Contexto fragmentado em silos",
    description: "Logs em um lugar, métricas em outro, traces em um terceiro. Entender a causa raiz de um erro exige navegar entre 3 ferramentas diferentes com contextos desconexos.",
    pain: "3 ferramentas para 1 resposta",
  },
  {
    icon: "hourglass",
    title: "Ciclos longos de validação",
    description: "Mudanças chegam ao usuário sem feedback real de produção. O time só descobre que algo está errado quando o usuário reclama — ou quando o sistema para.",
    pain: "Horas perdidas por incidente",
  },
  {
    icon: "construction",
    title: "Barreira de adoção absurda",
    description: "Setup complexo, agentes para instalar, documentação extensa. Times pequenos passam semanas tentando colocar observabilidade para funcionar antes de ver valor.",
    pain: "Semanas de setup sem valor",
  },
];

const MARKET_STATS = [
  { value: "95%", label: "dos pilotos de IA falham por falta de observabilidade" },
  { value: "4.7h", label: "tempo médio de resolução de incidentes sem contexto rico" },
  { value: "3x", label: "mais caro manter silos de observabilidade vs. wide events" },
];

export function ProblemsSection() {
  const ref = useIntersectionObserver('visible');
  return (
    <section ref={ref} id="problems" className={styles.section} aria-labelledby="problems-heading">
      <div className={["content-container", "section-padding"].join(" ")}>

        {/* Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>O Problema</span>
          <h2 id="problems-heading" className={styles.sectionTitle}>
            A indústria tem um blind spot histórico
          </h2>
          <p className={styles.sectionSubtitle}>
            Produção é tratada como destino de bugs, não como fonte de aprendizado.
            Isso cria um ciclo vicioso que impede times de iterarem rápido com confiança.
          </p>
        </div>

        {/* Market stats */}
        <div className={styles.statsRow} aria-label="Estatísticas do problema">
          {MARKET_STATS.map((stat) => (
            <div key={stat.value} className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Problem cards */}
        <div className={styles.problemsGrid}>
          {PROBLEMS.map((problem) => (
            <article key={problem.title} className={styles.problemCard}>
              <Icon name={problem.icon} className={styles.problemCardIcon} title={problem.title} />
              <div className={styles.problemCardContent}>
                <h3 className={styles.problemCardTitle}>{problem.title}</h3>
                <p className={styles.problemCardDescription}>{problem.description}</p>
                <div className={styles.problemCardPain}>
                  <span className={styles.painDot} aria-hidden="true" />
                  {problem.pain}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Cycle visual */}
        <div className={styles.cycleVisual} aria-label="Ciclo vicioso atual">
          <div className={styles.cycleLabel}>O ciclo vicioso de hoje</div>
          <div className={styles.cycleSteps}>
            {["Escreve código", "Faz deploy", "Algo quebra", "Abre painel", "Sem contexto", "Itera no escuro"].map((step, i) => (
              <React.Fragment key={step}>
                <div className={styles.cycleStep}>{step}</div>
                {i < 5 && <span className={styles.cycleArrow} aria-hidden="true">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
