"use client";
import React from "react";
import { Button } from "@/components/atoms/Button/Button";
import { LevelBadge } from "@/components/atoms/LevelBadge/LevelBadge";
import { useTerminalAnimation } from "@/hooks/useTerminalAnimation";
import type { EventLevel } from "@/types";
import styles from "./HeroSection.module.css";

function TerminalSimulator() {
  const { visibleLines } = useTerminalAnimation({ intervalMs: 1500, maxLines: 7 });
  return (
    <div className={styles.terminal} role="region" aria-label="Simulador de wide events em tempo real">
      <div className={styles.terminalTitleBar}>
        <span className={styles.trafficDot} style={{ background: "#FF5F56" }} />
        <span className={styles.trafficDot} style={{ background: "#FFBD2E" }} />
        <span className={styles.trafficDot} style={{ background: "#27C93F" }} />
        <span className={styles.terminalTitle}>pantor — wide events live</span>
      </div>
      <div className={styles.terminalBody}>
        <div className={styles.terminalPromptLine}>
          <span className={styles.promptSymbol}>$</span>
          <span className={styles.promptText}>pantor stream --project acme-prod --tail</span>
          <span className={styles.cursor} aria-hidden="true" />
        </div>
        <div className={styles.eventLines} aria-live="polite" aria-atomic="false">
          {visibleLines.map((event, idx) => (
            <div key={`${event.eventType}-${idx}`} className={styles.eventLine} style={{ animationDelay: `${idx * 50}ms` }}>
              <span className={styles.eventTimestamp}>{event.timestamp}</span>
              <LevelBadge level={event.level as EventLevel} size="sm" />
              <span className={styles.eventType}>{event.eventType}</span>
              <span className={styles.eventAttrs}>{event.attrs}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.terminalFooter}>
        <span className={styles.terminalBadge}>● LIVE</span>
        <span className={styles.terminalStats}>1 projeto · acme-prod</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  const handleWaitlistClick = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };
  const handleLearnMoreClick = () => {
    document.getElementById("problems")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      {/* Background decorations */}
      <div className={styles.heroGradientBlob} aria-hidden="true" />
      <div className={styles.heroGridBg} aria-hidden="true" />

      <div className={[styles.heroInner, "content-container"].join(" ")}>
        {/* Left: Copy */}
        <div className={styles.heroCopy}>
          

          <h1 id="hero-heading" className={styles.heroHeading}>
            Produção é onde o<br />
            <span className={styles.heroHeadingAccent}>entendimento mora.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Observabilidade para Desenvolvedores. Wide events substituem logs, métricas e traces em um único evento rico que captura o contexto completo de cada request.
            Primeiro evento em produção em <strong>menos de 15 minutos</strong>.
            Custo previsível, zero silos.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>15min</span>
              <span className={styles.heroStatLabel}>Setup até o 1º evento</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>1 linha</span>
              <span className={styles.heroStatLabel}>Para inicializar o SDK</span>
            </div>
            <div className={styles.heroStatDivider} aria-hidden="true" />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>Zero</span>
              <span className={styles.heroStatLabel}>Silos de dados</span>
            </div>
          </div>

          <div className={styles.heroCtas}>
            <Button variant="primary" size="lg" onClick={handleWaitlistClick} aria-label="Entrar na lista de espera do Pantor">
              Entrar na Waitlist
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 8h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M9.5 3.5L14 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <Button variant="ghost" size="lg" onClick={handleLearnMoreClick} aria-label="Ver como funciona o Pantor">
              Ver como funciona
            </Button>
          </div>

        
        </div>

        {/* Right: Terminal */}
        <div className={styles.heroTerminalWrapper}>
          <TerminalSimulator />
          <div className={styles.sdkSnippetCard}>
            <span className={styles.sdkSnippetLabel}>SDK em 1 linha</span>
            <code className={styles.sdkSnippetCode}>
              <span style={{ color: "var(--color-debug)" }}>import</span>
              <span style={{ color: "var(--text-primary)" }}> {"{"} pantor {"}"} </span>
              <span style={{ color: "var(--color-debug)" }}>from</span>
            </code>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.scrollDot} />
      </div>
    </section>
  );
}
