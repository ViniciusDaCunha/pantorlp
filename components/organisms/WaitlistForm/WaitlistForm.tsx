"use client";
import React from "react";
import { Button } from "@/components/atoms/Button/Button";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";
import type { DeveloperRole } from "@/types";
import styles from "./WaitlistForm.module.css";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Icon, type IconName } from "@/components/atoms/Icon/Icon";

const ROLE_OPTIONS: { value: DeveloperRole; label: string }[] = [
  { value: "developer", label: "Desenvolvedor(a)" },
  { value: "tech-lead", label: "Tech Lead" },
  { value: "cto", label: "CTO" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Outro" },
];

function SuccessState({
  isDuplicate,
  onReset,
}: {
  isDuplicate: boolean;
  onReset: () => void;
}) {
  return (
    <div className={styles.successState} role="alert" aria-live="polite">
      <Icon
        name="celebration"
        className={styles.successIcon}
        title="Concluído"
      />
      <h3 className={styles.successTitle}>
        {isDuplicate ? "Você já está na lista!" : "Você entrou na waitlist!"}
      </h3>
      <p className={styles.successMessage}>
        {isDuplicate
          ? "Seu e-mail já está registrado. Entraremos em contato em breve!"
          : "Ótimo! Entraremos em contato assim que sua vaga no early access for liberada. Fique de olho na sua caixa de entrada."}
      </p>
      <div className={styles.successSteps}>
        <div className={styles.successStep}>
          <span className={styles.successStepNumber}>1</span>
          <span>Confirmação por e-mail em breve</span>
        </div>
        <div className={styles.successStep}>
          <span className={styles.successStepNumber}>2</span>
          <span>Convite para o early access</span>
        </div>
        <div className={styles.successStep}>
          <span className={styles.successStepNumber}>3</span>
          <span>Primeiro evento em produção em 15 min</span>
        </div>
      </div>
      <button
        className={styles.resetLink}
        onClick={onReset}
        aria-label="Cadastrar outro e-mail"
      >
        Cadastrar outro e-mail
      </button>
    </div>
  );
}

export function WaitlistForm() {
  const {
    formData,
    errors,
    status,
    isDuplicate,
    updateField,
    handleSubmit,
    reset,
    isLoading,
    isSuccess,
    isError,
  } = useWaitlistForm();
  const ref = useIntersectionObserver("visible");
  return (
    <section
      ref={ref}
      id="waitlist"
      className={styles.section}
      aria-labelledby="waitlist-heading"
    >
      <div className={styles.sectionGlow} aria-hidden="true" />

      <div className={["content-container", "section-padding"].join(" ")}>
        <div className={styles.waitlistWrapper}>
          {/* Left: Copy */}
          <div className={styles.waitlistCopy}>
            <span className={styles.sectionEyebrow}>Early Access</span>
            <h2 id="waitlist-heading" className={styles.sectionTitle}>
              Seja um dos primeiros a fechar o loop
            </h2>
            <p className={styles.sectionSubtitle}>
              Estamos construindo o Pantor para times que desenvolvem rápido e
              precisam de feedback real de produção. Junte-se à waitlist e ganhe
              acesso antecipado.
            </p>

            <div
              className={styles.benefitsList}
              aria-label="Benefícios do early access"
            >
              {[
                { icon: "gift", text: "Acesso antecipado ao produto" },
                { icon: "map", text: "Influência direta no roadmap" },
              ].map((benefit: { icon: string; text: string }) => (
                <div key={benefit.text} className={styles.benefitItem}>
                  <Icon
                    name={benefit.icon as IconName}
                    className={styles.benefitIcon}
                    title={benefit.text}
                  />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className={styles.formContainer}>
            {isSuccess ? (
              <SuccessState isDuplicate={isDuplicate} onReset={reset} />
            ) : (
              <form
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
                aria-label="Formulário de waitlist"
              >
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>Garantir minha vaga</h3>
                  <p className={styles.formSubtitle}>
                    Sem spam. Sem cartão de crédito.
                  </p>
                </div>

                {/* Email */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="waitlist-email" className={styles.fieldLabel}>
                    E-mail profissional{" "}
                    <span className={styles.required} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    className={[
                      styles.fieldInput,
                      errors.email ? styles.fieldError : "",
                    ].join(" ")}
                    placeholder="alice@suaempresa.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span
                      id="email-error"
                      className={styles.fieldErrorMessage}
                      role="alert"
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Role */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="waitlist-role" className={styles.fieldLabel}>
                    Qual é o seu papel?{" "}
                    <span className={styles.required} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <select
                    id="waitlist-role"
                    className={[
                      styles.fieldSelect,
                      errors.role ? styles.fieldError : "",
                    ].join(" ")}
                    value={formData.role}
                    onChange={(e) =>
                      updateField("role", e.target.value as DeveloperRole)
                    }
                    required
                    aria-required="true"
                    aria-describedby={errors.role ? "role-error" : undefined}
                    aria-invalid={!!errors.role}
                    disabled={isLoading}
                  >
                    <option value="">Selecione um papel...</option>
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <span
                      id="role-error"
                      className={styles.fieldErrorMessage}
                      role="alert"
                    >
                      {errors.role}
                    </span>
                  )}
                </div>

                {/* Company (optional) */}
                <div className={styles.fieldGroup}>
                  <label
                    htmlFor="waitlist-company"
                    className={styles.fieldLabel}
                  >
                    Empresa <span className={styles.optional}>(opcional)</span>
                  </label>
                  <input
                    id="waitlist-company"
                    type="text"
                    className={styles.fieldInput}
                    placeholder="Nome da sua empresa ou startup"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    autoComplete="organization"
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>

                {isError && (
                  <div className={styles.formErrorBanner} role="alert">
                    Algo deu errado. Por favor, tente novamente.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  aria-label="Entrar na lista de espera do Pantor"
                >
                  {isLoading
                    ? "Entrando na lista..."
                    : "Quero meu acesso antecipado →"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
