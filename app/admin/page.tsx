"use client";
import React, { useState, useEffect } from "react";
import { getAdminMetrics } from "@/lib/supabase";
import type { AdminMetrics } from "@/types";
import styles from "./admin.module.css";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "pantor-admin-2025";

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { onLogin(); }
    else { setError("Senha incorreta."); }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <span className={styles.loginLogoMark}>P</span>
          <span>pantor admin</span>
        </div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <label htmlFor="admin-password" className={styles.loginLabel}>Senha de acesso</label>
          <input
            id="admin-password"
            type="password"
            className={styles.loginInput}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="••••••••"
            autoFocus
          />
          {error && <span className={styles.loginError}>{error}</span>}
          <button type="submit" className={styles.loginButton}>Acessar Dashboard</button>
        </form>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle, color = "brand" }: { label: string; value: string | number; subtitle?: string; color?: "brand" | "success" | "warning" | "error" }) {
  return (
    <div className={[styles.metricCard, styles[`metric_${color}`]].join(" ")}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
      {subtitle && <span className={styles.metricSubtitle}>{subtitle}</span>}
    </div>
  );
}

function ConversionsChart({ data }: { data: AdminMetrics["conversionsByDay"] }) {
  const maxLeads = Math.max(...data.map((d) => d.leads), 1);
  const last14 = data.slice(-14);

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Conversões por dia (últimos 14 dias)</h3>
      <div className={styles.chart}>
        {last14.map((day) => (
          <div key={day.date} className={styles.chartBar}>
            <div
              className={styles.chartBarFill}
              style={{ height: `${(day.leads / maxLeads) * 100}%` }}
              title={`${day.date}: ${day.leads} leads`}
              aria-label={`${day.date}: ${day.leads} leads`}
            />
            <span className={styles.chartBarLabel}>
              {new Date(day.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RolesChart({ roles }: { roles: AdminMetrics["topRoles"] }) {
  const ROLE_LABELS: Record<string, string> = {
    developer: "Desenvolvedor", "tech-lead": "Tech Lead", cto: "CTO", founder: "Founder", other: "Outro",
  };
  const maxCount = Math.max(...roles.map((r) => r.count), 1);

  return (
    <div className={styles.rolesContainer}>
      <h3 className={styles.chartTitle}>Top roles</h3>
      <div className={styles.rolesList}>
        {roles.map((r) => (
          <div key={r.role} className={styles.roleRow}>
            <span className={styles.roleLabel}>{ROLE_LABELS[r.role] ?? r.role}</span>
            <div className={styles.roleBarTrack}>
              <div className={styles.roleBarFill} style={{ width: `${(r.count / maxCount) * 100}%` }} />
            </div>
            <span className={styles.roleCount}>{r.count}</span>
          </div>
        ))}
        {roles.length === 0 && <span className={styles.emptyState}>Nenhum dado ainda.</span>}
      </div>
    </div>
  );
}

function Dashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminMetrics()
      .then((data) => { if (data) setMetrics(data); else setError("Supabase não configurado."); })
      .catch(() => setError("Erro ao carregar métricas."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading} aria-live="polite">Carregando métricas...</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;
  if (!metrics) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardLogo}>
          <span className={styles.loginLogoMark}>P</span>
          <span className={styles.dashboardTitle}>Pantor Admin</span>
        </div>
        <span className={styles.dashboardSubtitle}>Métricas de validação de MVP</span>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard label="Visitantes únicos" value={metrics.totalVisitors.toLocaleString("pt-BR")} subtitle="Sessões únicas" color="brand" />
        <MetricCard label="Leads na Waitlist" value={metrics.totalLeads.toLocaleString("pt-BR")} subtitle="Total cadastrado" color="success" />
        <MetricCard label="Taxa de conversão" value={`${metrics.conversionRate}%`} subtitle="Leads / Visitantes" color={metrics.conversionRate >= 5 ? "success" : "warning"} />
        <MetricCard label="Meta de conversão" value={metrics.conversionRate >= 5 ? "✅ Atingida" : "⏳ Em progresso"} subtitle="Meta: 5% conversão" color={metrics.conversionRate >= 5 ? "success" : "warning"} />
      </div>

      <div className={styles.chartsGrid}>
        <ConversionsChart data={metrics.conversionsByDay} />
        <RolesChart roles={metrics.topRoles} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("pantor_admin_auth");
    if (stored === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem("pantor_admin_auth", "true");
    setIsAuthenticated(true);
  };

  return (
    <div className={styles.adminRoot}>
      {isAuthenticated ? <Dashboard /> : <LoginScreen onLogin={handleLogin} />}
    </div>
  );
}
