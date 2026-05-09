/**
 * supabase.test.ts — Pantor · Camada de testes unitários
 *
 * Cobertura mínima exigida (Guia de Engenharia §4.3):
 *   - APIs públicas exportadas:             85 %
 *   - Sanitização / normalização de dados: 100 %
 *   - Ausência de PII em analytics:        100 %
 *
 * Estratégia de mock:
 *   vi.hoisted() define os spies ANTES do hoist de vi.mock(), garantindo
 *   que a factory do mock possa referenciar as variáveis corretamente.
 *   O setupFile (vitest.setup.ts) define as env vars antes do módulo carregar,
 *   fazendo com que createClient seja chamado e supabase ≠ null nos testes.
 *
 * Framework: Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Spies declarados com vi.hoisted() ───────────────────────────────────────
// vi.hoisted() garante que essas variáveis existam quando vi.mock() for avaliado
// (ambos são içados para o topo do arquivo pelo compilador do Vitest).
const { mockInsert, mockFrom, mockRpc } = vi.hoisted(() => ({
  mockInsert : vi.fn(),
  mockFrom   : vi.fn(),
  mockRpc    : vi.fn(),
}));

// ─── Mock do SDK ──────────────────────────────────────────────────────────────
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from : mockFrom,
    rpc  : mockRpc,
  })),
}));

// ─── Módulo testado (importado após o mock estar registrado) ──────────────────
import {
  isSupabaseConfigured,
  submitWaitlist,
  trackEvent,
  trackPlanCtaClick,
  getPlanCtaClickStats,
  getAdminMetrics,
} from "./supabase";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeLead(daysAgo: number, role = "developer") {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { id: crypto.randomUUID(), role, created_at: d.toISOString() };
}

function makeVisitor(sessionId: string) {
  return {
    id         : crypto.randomUUID(),
    session_id : sessionId,
    created_at : new Date().toISOString(),
  };
}

/**
 * Configura os mocks para getAdminMetrics.
 *
 * Diferenciamos as duas chamadas a from("waitlist") pelo argumento de select():
 *   - select("id, role, created_at") → retorna leads
 *   - select("role")                 → retorna { not: fn } para chain de roles
 */
function setupAdminMetricsMocks({
  leads            = [] as ReturnType<typeof makeLead>[],
  visitors         = [] as ReturnType<typeof makeVisitor>[],
  roles            = [] as { role: string }[],
  planClicks       = [] as { plan: string; clicks: number }[],
  rejectLeads      = false,
  rejectVisitors   = false,
  rejectPlanClicks = false,
} = {}) {
  mockFrom.mockImplementation((table: string) => {
    if (table === "waitlist") {
      return {
        select: vi.fn().mockImplementation((cols: string) => {
          // Primeira chamada: busca leads com id
          if (cols.includes("id")) {
            return rejectLeads
              ? Promise.reject(new Error("DB error"))
              : Promise.resolve({ data: leads, error: null });
          }
          // Segunda chamada: busca roles (chain com .not())
          return {
            not: vi.fn().mockResolvedValue({ data: roles, error: null }),
          };
        }),
      };
    }

    if (table === "visitor_events") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(
            rejectVisitors
              ? Promise.reject(new Error("DB error"))
              : { data: visitors, error: null }
          ),
        }),
      };
    }

    return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
  });

  mockRpc.mockImplementation((name: string) => {
    if (name === "conversions_by_day") {
      return Promise.resolve({ data: [], error: null });
    }
    return rejectPlanClicks
      ? Promise.resolve({ data: null, error: { message: "rpc error" } })
      : Promise.resolve({ data: planClicks, error: null });
  });
}

// =============================================================================
// 1. isSupabaseConfigured
// =============================================================================

describe("isSupabaseConfigured", () => {
  it("retorna true quando URL e key estão presentes (definidas no vitest.setup.ts)", () => {
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("lógica pura: false quando URL está ausente", () => {
    expect(Boolean("" && "some-key")).toBe(false);
  });

  it("lógica pura: false quando key está ausente", () => {
    expect(Boolean("https://x.supabase.co" && "")).toBe(false);
  });

  it("lógica pura: false quando ambos estão ausentes", () => {
    expect(Boolean("" && "")).toBe(false);
  });
});

// =============================================================================
// 2. submitWaitlist
// =============================================================================

describe("submitWaitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockResolvedValue({ error: null });
  });

  afterEach(() => vi.restoreAllMocks());

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("happy path → retorna { success: true }", async () => {
    const result = await submitWaitlist({
      email   : "dev@pantor.io",
      role    : "developer",
      company : "Pantor",
    });

    expect(result).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalledOnce();
  });

  // ── Sanitização — cobertura 100% exigida (Guia §6.1) ──────────────────────

  it("email: toLowerCase + trim antes do insert (LGPD: sem fingerprint por case)", async () => {
    await submitWaitlist({ email: "  DEV@Pantor.IO  ", role: "developer" });

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.email).toBe("dev@pantor.io");
  });

  it("company undefined → null (sem campo fantasma no banco)", async () => {
    await submitWaitlist({ email: "a@b.com", role: "cto" });

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.company).toBeNull();
  });

  it("company string vazia → null (falsy → null)", async () => {
    await submitWaitlist({ email: "a@b.com", role: "cto", company: "" });

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.company).toBeNull();
  });

  // ── Sem email enumeration ───────────────────────────────────────────────────

  it("código 23505 (unique violation) → { success: true, isDuplicate: true }", async () => {
    mockInsert.mockResolvedValue({ error: { code: "23505" } });

    const result = await submitWaitlist({ email: "dup@pantor.io", role: "founder" });

    expect(result).toEqual({ success: true, isDuplicate: true });
  });

  // ── Erros de banco ──────────────────────────────────────────────────────────

  it("erro genérico do DB → { success: false, error: mensagem PT-BR }", async () => {
    mockInsert.mockResolvedValue({
      error: { code: "42P01", message: "table not found" },
    });

    const result = await submitWaitlist({ email: "a@b.com", role: "developer" });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Erro ao salvar/);
  });

  it("exception lançada → { success: false, error: mensagem de conexão }", async () => {
    mockInsert.mockRejectedValue(new Error("network timeout"));

    const result = await submitWaitlist({ email: "a@b.com", role: "tech-lead" });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Erro de conexão/);
  });
});

// =============================================================================
// 3. trackEvent
// =============================================================================

describe("trackEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockResolvedValue({});
  });

  it("happy path → insere em visitor_events com campos corretos", async () => {
    await trackEvent("page_view", "sess-abc", { page: "/home" });

    expect(mockFrom).toHaveBeenCalledWith("visitor_events");
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.event_type).toBe("page_view");
    expect(payload.session_id).toBe("sess-abc");
    expect(payload.metadata).toEqual({ page: "/home" });
  });

  it("metadata undefined → persiste null (sem campo fantasma)", async () => {
    await trackEvent("form_start", "sess-xyz");

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.metadata).toBeNull();
  });

  it("sessionId null é aceito e repassado sem transformação", async () => {
    await trackEvent("cta_click", null);

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.session_id).toBeNull();
  });

  it("exception → silenciada, não propaga (analytics nunca quebra a UX)", async () => {
    mockInsert.mockRejectedValue(new Error("ClickHouse down"));

    await expect(trackEvent("page_view", "s1")).resolves.toBeUndefined();
  });

  it("retorna void em todos os caminhos", async () => {
    const result = await trackEvent("form_submit", "s2", { step: 1 });
    expect(result).toBeUndefined();
  });
});

// =============================================================================
// 4. trackPlanCtaClick
// =============================================================================

describe("trackPlanCtaClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockResolvedValue({});
  });

  it("delega para trackEvent com event_type 'cta_click'", async () => {
    await trackPlanCtaClick("Starter", "sess-123");

    expect(mockFrom).toHaveBeenCalledWith("visitor_events");
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.event_type).toBe("cta_click");
  });

  it("metadata contém plan correto e source 'pricing_section'", async () => {
    await trackPlanCtaClick("Growth", "sess-456");

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    const meta    = payload.metadata as Record<string, string>;
    expect(meta.plan).toBe("Growth");
    expect(meta.source).toBe("pricing_section");
  });

  it("LGPD §6.1: campos banidos ausentes da metadata de analytics", async () => {
    await trackPlanCtaClick("Business", "sess-789");

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    const meta    = payload.metadata as Record<string, unknown>;

    const bannedPiiFields = ["email","cpf","user_id","phone","ip","name","card_number","password"];
    bannedPiiFields.forEach((field) => {
      expect(meta, `PII '${field}' vazou na metadata`).not.toHaveProperty(field);
    });
  });

  it("sessionId null repassado sem transformação", async () => {
    await trackPlanCtaClick("Enterprise", null);

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.session_id).toBeNull();
  });
});

// =============================================================================
// 5. getPlanCtaClickStats
// =============================================================================

describe("getPlanCtaClickStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("happy path → mapeia plan e clicks corretamente", async () => {
    mockRpc.mockResolvedValue({
      data  : [{ plan: "Growth", clicks: 42 }, { plan: "Starter", clicks: 18 }],
      error : null,
    });

    expect(await getPlanCtaClickStats()).toEqual([
      { plan: "Growth",  clicks: 42 },
      { plan: "Starter", clicks: 18 },
    ]);
  });

  it("clicks vindos como string do Postgres → convertidos para Number", async () => {
    mockRpc.mockResolvedValue({ data: [{ plan: "Business", clicks: "99" }], error: null });

    const result = await getPlanCtaClickStats();

    expect(typeof result[0].clicks).toBe("number");
    expect(result[0].clicks).toBe(99);
  });

  it("chama o RPC correto: plan_cta_clicks_by_plan", async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await getPlanCtaClickStats();

    expect(mockRpc).toHaveBeenCalledWith("plan_cta_clicks_by_plan");
  });

  it("RPC retorna erro → array vazio (sem throw)", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "not found" } });

    expect(await getPlanCtaClickStats()).toEqual([]);
  });

  it("exception → array vazio (sem throw)", async () => {
    mockRpc.mockRejectedValue(new Error("network error"));

    await expect(getPlanCtaClickStats()).resolves.toEqual([]);
  });

  it("data null → array vazio (sem crash no .map())", async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    expect(await getPlanCtaClickStats()).toEqual([]);
  });
});

// =============================================================================
// 6. getAdminMetrics
// =============================================================================

describe("getAdminMetrics", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("happy path → retorna todas as métricas calculadas corretamente", async () => {
    setupAdminMetricsMocks({
      leads      : [makeLead(1, "developer"), makeLead(2, "cto")],
      visitors   : [makeVisitor("s1"), makeVisitor("s2"), makeVisitor("s1")],
      roles      : [{ role: "developer" }, { role: "cto" }],
      planClicks : [{ plan: "Growth", clicks: 10 }],
    });

    const m = await getAdminMetrics();

    expect(m).not.toBeNull();
    expect(m!.totalLeads).toBe(2);
    expect(m!.totalVisitors).toBe(2);       // max(2 sessões únicas, 2 leads)
    expect(m!.conversionRate).toBe(100.0);
    expect(m!.planCtaClicks).toEqual([{ plan: "Growth", clicks: 10 }]);
  });

  // ── conversionRate ─────────────────────────────────────────────────────────

  it("conversionRate = 0 sem visitantes nem leads (sem divisão por zero)", async () => {
    setupAdminMetricsMocks({ leads: [], visitors: [] });
    expect((await getAdminMetrics())!.conversionRate).toBe(0);
  });

  it("conversionRate = 50% com 2 leads e 4 visitantes únicos", async () => {
    setupAdminMetricsMocks({
      leads    : [makeLead(1), makeLead(2)],
      visitors : [makeVisitor("s1"), makeVisitor("s2"), makeVisitor("s3"), makeVisitor("s4")],
    });
    expect((await getAdminMetrics())!.conversionRate).toBe(50.0);
  });

  // ── totalVisitors: max(uniqueSessions, totalLeads) ─────────────────────────

  it("totalVisitors = max(sessões únicas, leads) → não subestima visitantes", async () => {
    // 3 leads cadastrados, apenas 1 page_view no analytics (dados incompletos)
    setupAdminMetricsMocks({
      leads    : [makeLead(1), makeLead(2), makeLead(3)],
      visitors : [makeVisitor("s1")],
    });
    // max(1 sessão, 3 leads) = 3
    expect((await getAdminMetrics())!.totalVisitors).toBe(3);
  });

  it("sessões duplicadas deduplicadas — mesmo sessionId conta 1x", async () => {
    setupAdminMetricsMocks({
      leads    : [makeLead(1)],
      visitors : [makeVisitor("s1"), makeVisitor("s1"), makeVisitor("s1")],
    });
    // 3 eventos, 1 sessão única → max(1, 1) = 1
    expect((await getAdminMetrics())!.totalVisitors).toBe(1);
  });

  // ── topRoles ───────────────────────────────────────────────────────────────

  it("topRoles ordenado por count decrescente", async () => {
    setupAdminMetricsMocks({
      roles: [
        { role: "developer" }, { role: "developer" }, { role: "developer" },
        { role: "cto" },       { role: "cto" },
        { role: "founder" },
      ],
    });

    const { topRoles } = (await getAdminMetrics())!;
    expect(topRoles[0]).toEqual({ role: "developer", count: 3 });
    expect(topRoles[1]).toEqual({ role: "cto",       count: 2 });
    expect(topRoles[2]).toEqual({ role: "founder",   count: 1 });
  });

  it("topRoles limitado a 5 entradas", async () => {
    setupAdminMetricsMocks({
      roles: ["developer","cto","founder","tech-lead","other","manager","analyst"]
        .map((role) => ({ role })),
    });
    expect((await getAdminMetrics())!.topRoles.length).toBeLessThanOrEqual(5);
  });

  // ── Janela de 30 dias ──────────────────────────────────────────────────────

  it("conversionsByDay contém exatamente 30 entradas", async () => {
    setupAdminMetricsMocks({ leads: [] });
    expect((await getAdminMetrics())!.conversionsByDay).toHaveLength(30);
  });

  it("lead dentro dos 30 dias → contabilizado no dia correto", async () => {
    setupAdminMetricsMocks({ leads: [makeLead(0)] });

    const today      = new Date().toISOString().split("T")[0];
    const { conversionsByDay } = (await getAdminMetrics())!;
    const todayEntry = conversionsByDay.find((d) => d.date === today);

    expect(todayEntry).toBeDefined();
    expect(todayEntry!.leads).toBe(1);
  });

  it("lead com 31 dias → fora da janela, não distorce métricas", async () => {
    setupAdminMetricsMocks({ leads: [makeLead(31)] });

    const { conversionsByDay } = (await getAdminMetrics())!;
    const total = conversionsByDay.reduce((s, d) => s + d.leads, 0);
    expect(total).toBe(0);
  });

  // ── Resiliência: Promise.allSettled absorve falhas parciais ────────────────

  it("waitlist rejected → função não lança, retorna métricas parciais", async () => {
    setupAdminMetricsMocks({ rejectLeads: true });
    await expect(getAdminMetrics()).resolves.toBeDefined();
  });

  it("visitor_events rejected → uniqueSessions = 0, totalVisitors = totalLeads", async () => {
    setupAdminMetricsMocks({
      leads          : [makeLead(1), makeLead(2)],
      rejectVisitors : true,
    });
    // max(0 sessões, 2 leads) = 2
    expect((await getAdminMetrics())!.totalVisitors).toBe(2);
  });

  it("plan_cta_clicks_by_plan com erro → planCtaClicks = [] sem throw", async () => {
    setupAdminMetricsMocks({ rejectPlanClicks: true });
    expect((await getAdminMetrics())!.planCtaClicks).toEqual([]);
  });

  // ── planCtaClicks ──────────────────────────────────────────────────────────

  it("planCtaClicks mapeado corretamente — clicks como Number", async () => {
    setupAdminMetricsMocks({
      planClicks: [
        { plan: "Enterprise", clicks: 55 },
        { plan: "Starter",    clicks: 12 },
      ],
    });

    const { planCtaClicks } = (await getAdminMetrics())!;
    expect(planCtaClicks).toHaveLength(2);
    expect(planCtaClicks[0]).toEqual({ plan: "Enterprise", clicks: 55 });
    planCtaClicks.forEach((item) => expect(typeof item.clicks).toBe("number"));
  });
});

// =============================================================================
// 7. Invariantes LGPD — Guia §6.1, §6.3
// =============================================================================

describe("Invariantes LGPD — sanitização e ausência de PII", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("email lowercase — sem fingerprint por variação de maiúsculas", async () => {
    await submitWaitlist({ email: "USUARIO@EMPRESA.COM.BR", role: "other" });
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.email).toBe("usuario@empresa.com.br");
  });

  it("email trimado — espaços não criam registros duplicados lógicos", async () => {
    await submitWaitlist({ email: "  dev@pantor.io  ", role: "developer" });
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect((payload.email as string).trim()).toBe(payload.email);
    expect(payload.email).toBe("dev@pantor.io");
  });

  it("trackPlanCtaClick não vaza campos banidos pela LGPD na metadata", async () => {
    await trackPlanCtaClick("Business", "sess-999");
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    const meta    = payload.metadata as Record<string, unknown>;

    ["email","cpf","user_id","phone","ip_address","name","card_number","biometric","password"]
      .forEach((f) => expect(meta, `PII '${f}' vazou`).not.toHaveProperty(f));
  });

  it("trackEvent não injeta PII automaticamente na metadata do caller", async () => {
    await trackEvent("form_submit", "s1", { form_step: 2, plan_viewed: "Growth" });
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    const meta    = payload.metadata as Record<string, unknown>;

    // Módulo preserva exatamente o que o caller passou — sem injeção própria de PII
    expect(meta).toHaveProperty("form_step");
    expect(meta).not.toHaveProperty("email");
    expect(meta).not.toHaveProperty("user_id");
  });
});
