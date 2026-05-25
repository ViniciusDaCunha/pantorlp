# AGENTS.md — Pantor Blog × LP
## Fase 3 — SEO, Feeds, Newsletter + SRE Hardening

> **Gerado por:** Claude Code | **Data:** 2026-05-22
> **Fase ativa:** FASE 3 + SRE paralelo
> **Referência:** HELIX.md v3.0
> **Objetivo:** Blog indexável. RSS e sitemap ativos. Newsletter captura emails. Código das Fases 1–2 auditado e endurecido contra o Protocolo SRE.

---

## LEIA ANTES DE EXECUTAR

### Duas frentes simultâneas nesta fase

**Frente A — SRE Hardening:** refatora código existente (Fases 1–2) para conformidade com o Protocolo SRE do HELIX.md Seção 2.5. Tasks SRE-01 a SRE-05. Rodam na Onda 1, em paralelo com tasks funcionais independentes.

**Frente B — Funcional:** implementa SEO, RSS, OG, newsletter, sitemap.

### Protocolo SRE — obrigatório em todas as tasks desta fase

Qualquer código que você escrever ou modificar nesta fase deve seguir:

```
SRE-P1  Route Handlers: validação de input antes de qualquer operação
SRE-P2  Sanitização: sanitizeEmail(), sanitizeSlug() de lib/blog/sanitize.ts
SRE-P3  Error Boundaries: Client Components que processam dados externos
SRE-P4  Trust Boundary: Function(code) apenas para post.body do blogRepository
SRE-P5  Headers: X-Content-Type-Options + Cache-Control em Route Handlers
SRE-P6  Rate Limiting: 429 + Retry-After em endpoints de escrita
SRE-P7  Logging: structured, sem PII — nunca logar email, body completo ou stack trace
SRE-P8  Supabase: guard !supabase + sanitização antes de qualquer query
```

Referência completa: HELIX.md Seção 2.5.

### Constraints Globais — nunca violar

```
ARQUITETURA:
  ✗ Nenhum arquivo fora de lib/blog/ importa de @/.velite
  ✗ domain/ não importa nada externo
  ✗ Route Handlers não importam lib/blog/ diretamente — usam funções de lib/blog/db.ts
  ✓ lib/blog/sanitize.ts é importado por lib/blog/db.ts e pelos Route Handlers

TYPESCRIPT:
  ✗ Zero any
  ✓ await params em todas as rotas dinâmicas (ADR-012)
  ✓ generateStaticParams retorna T[] mutável (ADR-012)

ROUTE HANDLERS:
  ✗ Zero operação de banco sem validação de input antes
  ✗ Zero log de PII (email, IP, nome)
  ✓ Status codes consistentes: 200/400/422/429/500
  ✓ SECURITY_HEADERS em toda resposta

SEO:
  ✗ Zero string de metadata hardcoded em páginas — tudo via lib/blog/seo.ts
  ✓ canonical em toda página de blog
  ✓ openGraph em toda página de blog
```

---

## MAPA DE EXECUÇÃO — FASE 3

```
ONDA 1 ─────────────────────────────────────── (paralelo total)
  SRE-01  Refatorar PostContent            [sem dependências]
  SRE-03  MDXErrorBoundary reutilizável    [sem dependências]
  SRE-04  Centralizar toSummary()          [sem dependências]
  SRE-05  Auditoria zero <a href>          [sem dependências]
  T44     lib/blog/sanitize.ts             [sem dependências]

ONDA 2 ─────────────────────────────────────── (paralelo)
  SRE-02  Refatorar PostSidebar            [depende: SRE-01 ← velite.config headings]
  T32     lib/blog/seo.ts                  [depende: T10 ✅]
  T37     app/sitemap.ts                   [depende: T10 ✅]

ONDA 3 ─────────────────────────────────────── (paralelo)
  T34     api/blog/og/route.tsx            [depende: T32]
  T36     lib/blog/feed.ts + rss/route     [depende: T32]
  T38     public/robots.txt                [depende: T37]
  T39*    Migration Supabase               [depende: — | CLAUDE CODE]

ONDA 4 ─────────────────────────────────────── (paralelo)
  T33     generateMetadata centralizado    [depende: T32, T15 ✅]
  T40     lib/blog/db.ts                   [depende: T44, T39]

ONDA 5 ─────────────────────────────────────── (paralelo)
  T35     JSON-LD em [slug]/page           [depende: T33]
  T41     newsletter/route.ts              [depende: T40]

ONDA 6 ─────────────────────────────────────── (paralelo)
  T42     BlogNewsletter organism          [depende: T41]

ONDA 7 ─────────────────────────────────────── (sequencial)
  T43     Integrar trackEvent()            [depende: T42]

GATE FASE 3: build limpo. Sitemap e RSS acessíveis. Newsletter persiste.
             OG gerada. JSON-LD válido. Zero violações SRE.
```

---

## TASKS SRE — ONDA 1

---

### SRE-01 · Refatorar PostContent — Error Boundary + Trust Boundary
**Onda:** 1 | **Agente:** Codex | **Prioridade:** CRÍTICO (SRE-P3, SRE-P4)

**Objetivo:** Adicionar error boundary em volta do render MDX e documentar trust boundary explicitamente. Não alterar a lógica de renderização `Function(code)` — apenas torná-la segura e auditável.

**Arquivo a modificar:** `components/organisms/PostContent/PostContent.tsx`

**Mudanças obrigatórias:**

```typescript
// 1. Adicionar comentário de trust boundary logo antes de Function(code):
// ⚠️ TRUST BOUNDARY (ADR-011): post.body é EXCLUSIVAMENTE build artifact do Velite.
// Gerado em build time por velite.config.ts — nunca input de usuário ou conteúdo remoto.
// Não alterar este bloco para aceitar qualquer outra fonte sem revisão de segurança.

// 2. Adicionar guard para módulos não permitidos:
const runtimeRequire = (mod: string) => {
  if (mod === 'react/jsx-runtime') return runtime;
  // Guard explícito: bloquear qualquer tentativa de require inesperado
  throw new Error(`[PostContent] módulo não autorizado: ${mod}`);
};

// 3. Envolver o render com try/catch + fallback:
function MDXRenderer({ code, components }: { code: string; components: Record<string, unknown> }) {
  try {
    const { default: MDXContent } = new Function('require', code)(runtimeRequire);
    return <MDXContent components={components} />;
  } catch (error) {
    console.error('[PostContent] MDX render error', (error as Error).message);
    return (
      <p role='alert' aria-live='polite'>
        Erro ao renderizar o conteúdo. Tente recarregar a página.
      </p>
    );
  }
}
```

**Não alterar:**
- A API pública do componente `PostContent({ post })` permanece idêntica
- O mapa de componentes MDX (pre: CodeBlock etc.)
- CSS Module

**Acceptance criteria:**
- [ ] Comentário de trust boundary presente, palavra "TRUST BOUNDARY" no texto
- [ ] `runtimeRequire` com guard que lança erro para módulos não-runtime
- [ ] try/catch em volta de `new Function(...)` com fallback de UI acessível (`role='alert'`)
- [ ] `console.error` com mensagem estruturada sem dados do post
- [ ] Nenhuma alteração na API pública ou no CSS
- [ ] `tsc --noEmit` passa

**Depends on:** nenhuma

---

### SRE-03 · Criar MDXErrorBoundary reutilizável
**Onda:** 1 | **Agente:** Codex | **Prioridade:** HIGH (SRE-P3)

**Arquivo a criar:** `components/atoms/MDXErrorBoundary/MDXErrorBoundary.tsx`

```typescript
// components/atoms/MDXErrorBoundary/MDXErrorBoundary.tsx
// Error Boundary para componentes que renderizam MDX ou conteúdo dinâmico.
// Class component obrigatório: hooks não podem capturar erros de render.
'use client';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import styles from './MDXErrorBoundary.module.css';

interface Props {
  readonly children:  ReactNode;
  readonly fallback?: ReactNode;
}

interface State {
  readonly hasError: boolean;
}

export class MDXErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Logging estruturado — sem dados do conteúdo (PII/segurança)
    console.error('[MDXErrorBoundary] render error', {
      message: error.message,
      componentStack: info.componentStack?.split('\n')[1]?.trim(),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className={styles.fallback} role='alert'>
          <p>Erro ao renderizar o conteúdo.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className={styles.retry}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Arquivo a criar:** `components/atoms/MDXErrorBoundary/MDXErrorBoundary.module.css`

```css
.fallback {
  padding: 1.5rem;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 0.5rem;
  text-align: center;
  color: var(--color-text-muted, #6b7280);
}

.retry {
  margin-top: 0.75rem;
  padding: 0.375rem 1rem;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 0.375rem;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
}
```

**Acceptance criteria:**
- [ ] Class component com `getDerivedStateFromError` e `componentDidCatch`
- [ ] `componentDidCatch` loga apenas `error.message` e primeira linha de `componentStack`
- [ ] Fallback customizável via prop `fallback`
- [ ] Botão "Tentar novamente" reseta o estado
- [ ] `role='alert'` no fallback padrão
- [ ] CSS Module criado
- [ ] `tsc --noEmit` passa

**Depends on:** SRE-01

---

### SRE-04 · Centralizar toSummary() em lib/blog/contentlayer.ts
**Onda:** 1 | **Agente:** Codex | **Prioridade:** MEDIUM (DT-15)

**Objetivo:** `toSummary(post: BlogPost): BlogPostSummary` está duplicado em `app/blog/page.tsx`, `components/organisms/RelatedPosts/RelatedPosts.tsx` e possivelmente outros. Centralizar em `lib/blog/contentlayer.ts` e exportar.

**Arquivo a modificar:** `lib/blog/contentlayer.ts`

```typescript
// Adicionar e exportar — não duplicar nos consumidores:
export function toSummary(post: BlogPost): BlogPostSummary {
  return {
    slug:        post.slug as string,
    title:       post.title,
    description: post.description,
    publishedAt: post.publishedAt.toISOString(),
    readingTime: post.readingTime.minutes,
    category:    (post.category as BlogCategory).slug,
    tags:        post.tags as string[],
    author:      post.author.slug,
  };
}
```

**Arquivos a modificar (remover implementações duplicadas e importar de lib/blog/contentlayer):**
- `app/blog/page.tsx` — substituir mapeamento inline por `import { toSummary } from '@/lib/blog/contentlayer'`
- `components/organisms/RelatedPosts/RelatedPosts.tsx` — idem
- Qualquer outro arquivo que contenha a mesma lógica de mapeamento

**Acceptance criteria:**
- [ ] `toSummary` exportado de `lib/blog/contentlayer.ts`
- [ ] Zero implementações duplicadas do mapeamento `BlogPost → BlogPostSummary`
- [ ] Todos os consumidores importam de `@/lib/blog/contentlayer`
- [ ] `tsc --noEmit` passa
- [ ] `next build` passa

**Depends on:** nenhuma

---

### SRE-05 · Auditoria — zero `<a href>` e zero import `@/.velite` fora de lib/blog/
**Onda:** 1 | **Agente:** Codex | **Prioridade:** HIGH

**Objetivo:** Verificar e corrigir duas constraints críticas que podem ter escorregado na implementação.

**Comandos de auditoria (executar primeiro, corrigir o que encontrar):**

```bash
# Auditoria 1: <a href> para rotas internas /blog (deve retornar zero)
grep -rn '<a href="/blog\|<a href={`/blog' \
  components/ app/blog/ \
  --include="*.tsx" --include="*.ts"

# Auditoria 2: import de @/.velite fora de lib/blog/ (deve retornar zero)
grep -rn '@/.velite' \
  app/ components/ hooks/ domain/ \
  --include="*.tsx" --include="*.ts"

# Auditoria 3: any explícito (deve retornar zero em arquivos do blog)
grep -rn ': any\b\|as any\b' \
  domain/blog/ lib/blog/ components/molecules/ components/organisms/Blog* \
  hooks/useTable* hooks/useReading* \
  --include="*.tsx" --include="*.ts"
```

**Para cada ocorrência encontrada:**
- `<a href>` para rota interna → substituir por `<Link href>` do next/link
- `import @/.velite` fora de lib/blog/ → mover lógica para lib/blog/contentlayer.ts e importar via repositório
- `: any` → tipar corretamente

**Acceptance criteria:**
- [ ] `grep <a href="/blog` em components/ e app/blog/ retorna zero resultados
- [ ] `grep @/.velite` fora de lib/blog/ retorna zero resultados
- [ ] `grep ': any'` nos arquivos do blog retorna zero resultados
- [ ] `tsc --noEmit` passa após correções

**Depends on:** nenhuma

---

### SRE-02 · Refatorar PostSidebar — Headings via campo Velite (não regex)
**Onda:** 2 | **Agente:** Codex | **Prioridade:** HIGH (DT-13)

**Objetivo:** Substituir a extração de headings via regex de `body.code` por um campo computado no Velite. A regex está acoplada ao formato de output do Velite 0.3.1 e quebra em qualquer upgrade.

**Passo 1 — Adicionar campo `headings` ao velite.config.ts:**

```typescript
// velite.config.ts — adicionar ao schema do Post:
import { unified }      from 'unified';
import remarkParse      from 'remark-parse';
import { visit }        from 'unist-util-visit';
import type { Heading, Text } from 'mdast';

// Adicionar ao schema:
headings: s.custom<ReadonlyArray<{ id: string; text: string; level: 2 | 3 }>>()
  .transform(async (_val, { meta }) => {
    const content = await fs.promises.readFile(meta.filePath, 'utf-8');
    const tree    = unified().use(remarkParse).parse(content);
    const result: Array<{ id: string; text: string; level: 2 | 3 }> = [];

    visit(tree, 'heading', (node: Heading) => {
      if (node.depth !== 2 && node.depth !== 3) return;
      const text = node.children
        .filter((c): c is Text => c.type === 'text')
        .map(c => c.value)
        .join('');
      const id   = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      result.push({ id, text, level: node.depth as 2 | 3 });
    });

    return result;
  }),
```

**Passo 2 — Adicionar `headings` à interface `BlogPost` em `domain/blog/entities.ts`:**

```typescript
readonly headings: ReadonlyArray<{
  readonly id:    string;
  readonly text:  string;
  readonly level: 2 | 3;
}>;
```

**Passo 3 — Atualizar `toDomainPost` em `lib/blog/contentlayer.ts`:**

```typescript
headings: raw.headings ?? [],
```

**Passo 4 — Refatorar `PostSidebar.tsx`:**
- Remover função `extractHeadings` e qualquer regex
- Usar `post.headings` diretamente: `const headings = post.headings`
- Passar para `useTableOfContents(post.headings)`

**Packages necessários (instalar se não existirem):**

```bash
npm install unified remark-parse unist-util-visit
npm install -D @types/unist
```

**Acceptance criteria:**
- [ ] `velite.config.ts` tem campo `headings` como computed field
- [ ] `domain/blog/entities.ts` tem `headings` na interface `BlogPost`
- [ ] `toDomainPost` mapeia `headings`
- [ ] `PostSidebar.tsx` sem regex — usa `post.headings`
- [ ] `<progress>` element preservado para barra de progresso (não regredir)
- [ ] `next build` passa e headings aparecem no TOC dos 3 posts seed
- [ ] `tsc --noEmit` passa

**ADR Draft obrigatório se `unified`/`remark-parse` causarem conflito de build:**
Retornar draft antes de improvisar solução alternativa.

**Depends on:** SRE-01 (entities.ts atualizado em paralelo)

---

## TASKS FUNCIONAIS

---

### T44 · Criar lib/blog/sanitize.ts
**Onda:** 1 | **Node:** N11.4 | **Agente:** Codex | **Prioridade:** BLOCKER (SRE-P2)

**Arquivo a criar:** `lib/blog/sanitize.ts`

```typescript
// lib/blog/sanitize.ts
// Funções puras de sanitização. Sem dependências externas.
// SRE-P2: usadas por lib/blog/db.ts e Route Handlers antes de qualquer persistência.

// EMAIL
// RFC 5321: máximo 254 chars. Normalizar lowercase + trim antes de validar.
const EMAIL_MAX_LENGTH = 254;
const EMAIL_REGEX      = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function sanitizeEmail(raw: string): string {
  return raw.toLowerCase().trim().slice(0, EMAIL_MAX_LENGTH);
}

export function isValidEmail(email: string): boolean {
  const sanitized = sanitizeEmail(email);
  return EMAIL_REGEX.test(sanitized) && sanitized.length <= EMAIL_MAX_LENGTH;
}

// SLUG
// Apenas [a-z0-9-], máximo 200 chars. Usado em sourceSlug de newsletter.
const SLUG_MAX_LENGTH = 200;

export function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= SLUG_MAX_LENGTH;
}

// TYPE GUARDS
// Usados em Route Handlers para validação de input antes de cast.
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
```

**Acceptance criteria:**
- [ ] Funções puras — zero dependências externas, zero efeitos colaterais
- [ ] `sanitizeEmail` aplica lowercase + trim + slice
- [ ] `isValidEmail` valida após sanitização
- [ ] `sanitizeSlug` remove tudo fora de `[a-z0-9-]`
- [ ] `isRecord` e `isString` exportados para type guards em Route Handlers
- [ ] `tsc --noEmit` passa

**Depends on:** nenhuma | **Bloqueia:** T40, T41

---

### T32 · Criar lib/blog/seo.ts
**Onda:** 2 | **Node:** N04.3 | **Agente:** Codex | **Prioridade:** HIGH

**Arquivo a criar:** `lib/blog/seo.ts`

```typescript
// lib/blog/seo.ts
// Centraliza toda a geração de metadata para as rotas do blog.
// Nenhuma página define título, descrição ou OG inline — tudo passa aqui.
// Acoplamento zero com Next.js além do tipo Metadata.

import type { Metadata }      from 'next';
import type { BlogPost }      from '@/domain/blog/entities';
import type { BlogCategory }  from '@/domain/blog/entities';

const SITE_NAME = 'Pantor';
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';

// ─── Blog Index ───────────────────────────────────────────────────────────────
export function generateBlogListMetadata(postCount: number): Metadata {
  const title       = `Blog — Observabilidade e Wide Events | ${SITE_NAME}`;
  const description = `${postCount} artigos técnicos sobre observabilidade, wide events, OpenTelemetry e engenharia de produção.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog` },
    openGraph: {
      type:        'website',
      title,
      description,
      url:         `${SITE_URL}/blog`,
      siteName:    SITE_NAME,
      images:      [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
    },
  };
}

// ─── Post Individual ─────────────────────────────────────────────────────────
export function generatePostMetadata(post: BlogPost): Metadata {
  const slug        = post.slug as string;
  const ogImageUrl  = post.ogImage ?? `${SITE_URL}/api/blog/og?slug=${slug}`;
  return {
    title:       `${post.title} | ${SITE_NAME}`,
    description: post.description,
    alternates:  { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      type:             'article',
      title:             post.title,
      description:       post.description,
      url:              `${SITE_URL}/blog/${slug}`,
      siteName:          SITE_NAME,
      publishedTime:     post.publishedAt.toISOString(),
      modifiedTime:      post.updatedAt.toISOString(),
      authors:          [post.author.name],
      tags:              post.tags as string[],
      images:           [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card:        'summary_large_image',
      title:        post.title,
      description:  post.description,
      images:      [ogImageUrl],
    },
  };
}

// ─── Categoria ───────────────────────────────────────────────────────────────
export function generateCategoryMetadata(category: BlogCategory): Metadata {
  const title = `${category.label} — Blog ${SITE_NAME}`;
  return {
    title,
    description:  category.description,
    alternates:  { canonical: `${SITE_URL}/blog/categoria/${category.slug}` },
    openGraph:   { type: 'website', title, description: category.description, siteName: SITE_NAME },
  };
}

// ─── Tag ─────────────────────────────────────────────────────────────────────
export function generateTagMetadata(tag: string): Metadata {
  const title       = `#${tag} — Blog ${SITE_NAME}`;
  const description = `Artigos sobre ${tag} no Blog da ${SITE_NAME}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/tag/${tag}` },
    openGraph:  { type: 'website', title, description, siteName: SITE_NAME },
  };
}

// ─── JSON-LD Article Schema ───────────────────────────────────────────────────
export function generatePostJsonLd(post: BlogPost): Record<string, unknown> {
  const slug = post.slug as string;
  return {
    '@context':         'https://schema.org',
    '@type':            'Article',
    headline:            post.title,
    description:         post.description,
    datePublished:       post.publishedAt.toISOString(),
    dateModified:        post.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name:     post.author.name,
      url:     `${SITE_URL}`,
    },
    publisher: {
      '@type': 'Organization',
      name:     SITE_NAME,
      url:      SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    image:             post.ogImage ?? `${SITE_URL}/api/blog/og?slug=${slug}`,
  };
}
```

**Acceptance criteria:**
- [ ] 5 funções exportadas: `generateBlogListMetadata`, `generatePostMetadata`, `generateCategoryMetadata`, `generateTagMetadata`, `generatePostJsonLd`
- [ ] `SITE_URL` lido de `NEXT_PUBLIC_SITE_URL` com fallback
- [ ] `generatePostMetadata` usa OG dinâmica como fallback quando `post.ogImage` é null
- [ ] `generatePostJsonLd` retorna objeto `Record<string, unknown>` (não string)
- [ ] Nenhuma referência a componentes React ou Next.js além de `Metadata`
- [ ] `tsc --noEmit` passa

**Depends on:** T10 ✅

---

### T37 · Criar app/sitemap.ts
**Onda:** 2 | **Node:** N08.5 | **Agente:** Codex | **Prioridade:** HIGH

**Arquivo a criar:** `app/sitemap.ts`

```typescript
// app/sitemap.ts — Server Component (Next.js Metadata API)
// Gerado em build time — SSG automático pelo Next.js.
import type { MetadataRoute } from 'next';
import { blogRepository }     from '@/lib/blog/contentlayer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories, tags] = await Promise.all([
    blogRepository.getAllSlugs(),
    blogRepository.getAllCategories(),
    blogRepository.getAllTags(),
  ]);

  const postEntries = slugs.map(slug => ({
    url:              `${SITE_URL}/blog/${slug as string}`,
    lastModified:      new Date(),
    changeFrequency:  'weekly'  as const,
    priority:          0.8,
  }));

  const categoryEntries = categories.map(cat => ({
    url:             `${SITE_URL}/blog/categoria/${cat.slug}`,
    lastModified:     new Date(),
    changeFrequency: 'weekly' as const,
    priority:         0.6,
  }));

  const tagEntries = tags.map(tag => ({
    url:             `${SITE_URL}/blog/tag/${tag as string}`,
    lastModified:     new Date(),
    changeFrequency: 'monthly' as const,
    priority:         0.4,
  }));

  return [
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...postEntries,
    ...categoryEntries,
    ...tagEntries,
  ];
}
```

**Acceptance criteria:**
- [ ] Exporta `default async function sitemap()`
- [ ] `Promise.all` para queries paralelas (não sequenciais)
- [ ] Inclui: `/blog`, posts, categorias, tags
- [ ] `changeFrequency` e `priority` diferenciados por tipo de rota
- [ ] `tsc --noEmit` passa

**Depends on:** T10 ✅

---

### T38 · Criar public/robots.txt
**Onda:** 3 | **Node:** N08.7 | **Agente:** Codex | **Prioridade:** MEDIUM

**Arquivo a criar:** `public/robots.txt`

```
User-agent: *
Allow: /blog/
Allow: /blog/categoria/
Allow: /blog/tag/
Disallow: /admin/
Disallow: /api/
Disallow: /.velite/

Sitemap: https://pantor.dev/sitemap.xml
```

**Acceptance criteria:**
- [ ] `Disallow: /admin/` e `Disallow: /api/` presentes
- [ ] `Sitemap:` aponta para URL de produção (não localhost)
- [ ] `/blog/` e subcategorias explicitamente permitidos

**Depends on:** T37

---

### T34 · Criar app/api/blog/og/route.tsx
**Onda:** 3 | **Node:** N08.2 | **Agente:** Codex | **Prioridade:** HIGH

**Arquivo a criar:** `app/api/blog/og/route.tsx`

```typescript
// app/api/blog/og/route.tsx
// Edge Runtime: ImageResponse para OG dinâmica por post.
// Cache de 1 hora — conteúdo estático por slug.
// SRE-P2: slug do query param sanitizado antes de qualquer operação.

import { ImageResponse } from 'next/og';
import { blogRepository }  from '@/lib/blog/contentlayer';
import { createSlug }      from '@/domain/blog/value-objects';
import { sanitizeSlug }    from '@/lib/blog/sanitize';

export const runtime = 'edge';

const CACHE_CONTROL = 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSlug          = searchParams.get('slug') ?? '';

  // SRE-P2: sanitizar antes de usar como chave de busca
  const slug = sanitizeSlug(rawSlug);
  if (!slug) {
    return new Response('slug inválido', { status: 400 });
  }

  const post = await blogRepository.getPostBySlug(createSlug(slug));
  if (!post) {
    return new Response('Post não encontrado', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display:         'flex',
          flexDirection:   'column',
          justifyContent:  'flex-end',
          width:           '100%',
          height:          '100%',
          padding:         '60px',
          backgroundColor: '#0f172a',
          color:           '#f1f5f9',
          fontFamily:      'sans-serif',
        }}
      >
        <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 16 }}>
          Pantor Blog · {(post.category as { label: string }).label}
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
          {post.title}
        </div>
        <div style={{ fontSize: 22, color: '#94a3b8', lineHeight: 1.5 }}>
          {post.description.slice(0, 120)}{post.description.length > 120 ? '…' : ''}
        </div>
        <div style={{ display: 'flex', marginTop: 40, alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 16, color: '#64748b' }}>
            {post.readingTime.minutes} min · {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    ),
    {
      width:   1200,
      height:  630,
      headers: { 'Cache-Control': CACHE_CONTROL },
    }
  );
}
```

**Acceptance criteria:**
- [ ] `export const runtime = 'edge'`
- [ ] `sanitizeSlug` aplicado no param `slug` antes de qualquer operação
- [ ] `400` para slug vazio/inválido, `404` para post não encontrado
- [ ] `Cache-Control` com `public, max-age=3600`
- [ ] Dimensões 1200×630
- [ ] `tsc --noEmit` passa

**Depends on:** T32, T44

---

### T36 · Criar lib/blog/feed.ts + app/api/blog/rss/route.tsx
**Onda:** 3 | **Node:** N08.6 | **Agente:** Codex | **Prioridade:** MEDIUM

**Arquivo a criar:** `lib/blog/feed.ts`

```typescript
// lib/blog/feed.ts
// Geração de XML RSS 2.0. Função pura — recebe posts, retorna string.
// Zero dependências de terceiros. Encoding manual para controle total.

import type { BlogPost } from '@/domain/blog/entities';

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';
const SITE_NAME = 'Pantor Blog';

function escapeXml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

export function generateRssFeed(posts: ReadonlyArray<BlogPost>): string {
  const items = posts.map(post => {
    const slug = post.slug as string;
    const url  = `${SITE_URL}/blog/${slug}`;
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <author>noreply@pantor.dev (${escapeXml(post.author.name)})</author>
      ${(post.tags as string[]).map(t => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`.trim();
  }).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/blog</link>
    <description>Artigos técnicos sobre observabilidade, wide events e engenharia de produção.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/blog/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}
```

**Arquivo a criar:** `app/api/blog/rss/route.tsx`

```typescript
// app/api/blog/rss/route.tsx
import { blogRepository } from '@/lib/blog/contentlayer';
import { generateRssFeed } from '@/lib/blog/feed';

export const dynamic    = 'force-static';
export const revalidate = false;

export async function GET() {
  const posts = await blogRepository.getPublishedPosts();
  const xml   = generateRssFeed(posts);

  return new Response(xml, {
    headers: {
      'Content-Type':  'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

**Acceptance criteria:**
- [ ] `escapeXml` escapa `& < > " '`
- [ ] Feed válido como RSS 2.0 (verificar com W3C RSS Validator)
- [ ] Route com `force-static` e `Cache-Control: public`
- [ ] `tsc --noEmit` passa

**Depends on:** T32

---

### T33 · Centralizar generateMetadata via seo.ts em todas as rotas
**Onda:** 4 | **Node:** N08.1 | **Agente:** Codex | **Prioridade:** HIGH

**Objetivo:** Substituir todas as implementações inline de `generateMetadata` nas rotas de blog por chamadas às funções de `lib/blog/seo.ts`. Nenhuma rota deve definir título, description ou openGraph inline.

**Arquivos a modificar:**

```typescript
// app/blog/page.tsx
import { generateBlogListMetadata } from '@/lib/blog/seo';

export async function generateMetadata(): Promise<Metadata> {
  const posts = await blogRepository.getPublishedPosts();
  return generateBlogListMetadata(posts.length);
}

// app/blog/[slug]/page.tsx
import { generatePostMetadata } from '@/lib/blog/seo';

export async function generateMetadata({ params }: { params: Promise<BlogSlugParams> }): Promise<Metadata> {
  const { slug } = await params;
  const post     = await blogRepository.getPostBySlug(createSlug(slug));
  if (!post) return {};
  return generatePostMetadata(post);
}

// app/blog/categoria/[categoria]/page.tsx
import { generateCategoryMetadata } from '@/lib/blog/seo';

export async function generateMetadata({ params }: { params: Promise<BlogCategoryParams> }): Promise<Metadata> {
  const { categoria } = await params;
  const categories    = await blogRepository.getAllCategories();
  const category      = categories.find(c => c.slug === categoria);
  if (!category) return {};
  return generateCategoryMetadata(category);
}

// app/blog/tag/[tag]/page.tsx
import { generateTagMetadata } from '@/lib/blog/seo';

export async function generateMetadata({ params }: { params: Promise<BlogTagParams> }): Promise<Metadata> {
  const { tag } = await params;
  return generateTagMetadata(tag);
}
```

**Acceptance criteria:**
- [ ] Zero string de título, description ou openGraph hardcoded nas 4 rotas de blog
- [ ] Todas as rotas importam de `@/lib/blog/seo`
- [ ] `tsc --noEmit` passa
- [ ] `next build` passa — metadata gerada corretamente para os 3 posts seed

**Depends on:** T32, T15 ✅

---

### T35 · Adicionar JSON-LD em app/blog/[slug]/page.tsx
**Onda:** 5 | **Node:** N08.4 | **Agente:** Codex | **Prioridade:** HIGH

**Arquivo a modificar:** `app/blog/[slug]/page.tsx`

```typescript
// Adicionar import:
import { generatePostJsonLd } from '@/lib/blog/seo';

// Adicionar no return do Page (dentro do <article> ou antes do <div className={styles.layout}>):
const jsonLd = generatePostJsonLd(post);

// No JSX:
<script
  type='application/ld+json'
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

**Acceptance criteria:**
- [ ] `<script type='application/ld+json'>` presente no HTML do post
- [ ] JSON-LD contém `@type: Article`, `headline`, `datePublished`, `author`, `publisher`
- [ ] `JSON.stringify` usado (não template string)
- [ ] `tsc --noEmit` passa

**Depends on:** T33

---

### T40 · Criar lib/blog/db.ts
**Onda:** 4 | **Node:** N04.5 | **Agente:** Codex | **Prioridade:** HIGH (SRE-P8)

**Arquivo a criar:** `lib/blog/db.ts`

**⚠️ SRE-P8 obrigatório:** guard `!supabase`, sanitização antes de qualquer query, logging sem PII.

```typescript
// lib/blog/db.ts
// Operações Supabase do blog. Segue SRE-P8.
// Importa sanitize — nunca usa string de input diretamente em query.

import { supabase }           from '@/lib/supabase';
import { sanitizeEmail, sanitizeSlug, isValidEmail } from '@/lib/blog/sanitize';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface NewsletterResult {
  readonly ok:          boolean;
  readonly isDuplicate: boolean;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export async function subscribeToBlogNewsletter(
  rawEmail:     string,
  rawSourceSlug: string
): Promise<NewsletterResult> {
  // Guard: supabase pode ser null em ambiente sem .env configurado
  if (!supabase) {
    console.warn('[db] supabase not configured');
    return { ok: false, isDuplicate: false };
  }

  const email      = sanitizeEmail(rawEmail);
  const sourceSlug = sanitizeSlug(rawSourceSlug);

  // Validação antes de persistir — nunca confiar em validação do caller
  if (!isValidEmail(email)) {
    return { ok: false, isDuplicate: false };
  }

  const { error } = await supabase
    .from('blog_newsletter_subscribers')
    .insert({ email, source_slug: sourceSlug, subscribed_at: new Date().toISOString() });

  if (error?.code === '23505') {
    return { ok: true, isDuplicate: true };  // unique_violation — não é erro para o usuário
  }

  if (error) {
    // SRE-P7: log estruturado sem email
    console.error('[db] newsletter insert error', { code: error.code, message: error.message });
    return { ok: false, isDuplicate: false };
  }

  return { ok: true, isDuplicate: false };
}

// ─── Views ────────────────────────────────────────────────────────────────────
export async function incrementPostView(rawSlug: string): Promise<void> {
  if (!supabase) return;

  const slug = sanitizeSlug(rawSlug);
  if (!slug) return;

  const { error } = await supabase.rpc('increment_post_view', { p_slug: slug });

  if (error) {
    console.error('[db] increment_post_view error', { code: error.code });
  }
}
```

**Acceptance criteria:**
- [ ] Guard `if (!supabase)` em todas as funções
- [ ] `sanitizeEmail` e `sanitizeSlug` aplicados antes de qualquer query
- [ ] `isValidEmail` validado antes de insert
- [ ] Código `23505` retorna `isDuplicate: true` — não erro
- [ ] `console.error` sem email ou dados do usuário
- [ ] `incrementPostView` usa `.rpc('increment_post_view')` (ADR-007)
- [ ] `tsc --noEmit` passa

**Depends on:** T44, T39 (migration executada)

---

### T41 · Criar app/api/blog/newsletter/route.ts
**Onda:** 5 | **Node:** N09.2 | **Agente:** Codex | **Prioridade:** BLOCKER (SRE-P1, P5, P6)

**Arquivo a criar:** `app/api/blog/newsletter/route.ts`

```typescript
// app/api/blog/newsletter/route.ts
// Route Handler de captura de newsletter. SRE-P1 + P5 + P6.
// Rate limiting via middleware.ts (implementado em T51).

import { subscribeToBlogNewsletter } from '@/lib/blog/db';
import { isValidEmail, isString, isRecord } from '@/lib/blog/sanitize';

// SRE-P5: headers de segurança em toda resposta
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control':          'no-store',
} as const;

export async function POST(request: Request) {
  // SRE-P1 — Passo 1: parse seguro
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'JSON inválido' },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  // SRE-P1 — Passo 2: type guard explícito
  if (!isRecord(body)) {
    return Response.json(
      { error: 'Formato inválido' },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  const email      = isString(body.email) ? body.email : '';
  const sourceSlug = isString(body.sourceSlug) ? body.sourceSlug : '';

  // SRE-P1 — Passo 3: validação de negócio
  if (!isValidEmail(email)) {
    return Response.json(
      { error: 'Email inválido' },
      { status: 422, headers: SECURITY_HEADERS }
    );
  }

  // SRE-P1 — Passo 4: operação de banco via lib/blog/db.ts
  const result = await subscribeToBlogNewsletter(email, sourceSlug);

  if (!result.ok && !result.isDuplicate) {
    return Response.json(
      { error: 'Erro interno' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }

  // 200 para sucesso E duplicado — evita enumeração de emails (SRE-P7)
  return Response.json(
    { ok: true },
    { status: 200, headers: SECURITY_HEADERS }
  );
}

// Rejeitar outros métodos explicitamente
export async function GET() {
  return Response.json(
    { error: 'Método não permitido' },
    { status: 405, headers: { ...SECURITY_HEADERS, Allow: 'POST' } }
  );
}
```

**Acceptance criteria:**
- [ ] Parse do JSON com try/catch — status 400 em falha
- [ ] Type guard `isRecord` e `isString` antes de qualquer acesso a campos
- [ ] `isValidEmail` valida antes de persistir — status 422 em email inválido
- [ ] `200` para sucesso E para email duplicado (anti-enumeração)
- [ ] `500` para erro de banco
- [ ] `SECURITY_HEADERS` em todas as respostas
- [ ] `GET` retorna `405`
- [ ] Zero log de email ou body completo
- [ ] `tsc --noEmit` passa

**Depends on:** T40

---

### T42 · Criar organism BlogNewsletter
**Onda:** 6 | **Node:** N06.11 | **Agente:** Codex | **Prioridade:** HIGH

**Arquivos a criar:**
- `components/organisms/BlogNewsletter/BlogNewsletter.tsx`
- `components/organisms/BlogNewsletter/BlogNewsletter.module.css`

```typescript
// 'use client' — requer useState para controle do formulário e feedback de envio
'use client';
import { useState, type FormEvent } from 'react';
import styles from './BlogNewsletter.module.css';

interface BlogNewsletterProps {
  readonly sourceSlug?: string;
}

type FormState = 'idle' | 'loading' | 'success' | 'error' | 'invalid';

export function BlogNewsletter({ sourceSlug = '' }: BlogNewsletterProps) {
  const [email,     setEmail]     = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validação client-side (UX) — servidor valida novamente (SRE-P1)
    if (!email.includes('@') || email.length < 3) {
      setFormState('invalid');
      return;
    }

    setFormState('loading');

    try {
      const response = await fetch('/api/blog/newsletter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, sourceSlug }),
      });

      if (response.ok) {
        setFormState('success');
        setEmail('');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className={styles.success} role='status'>
        <p>Inscrito com sucesso! Novos artigos no seu inbox.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Receba novos artigos</p>
      <p className={styles.description}>
        Conteúdo técnico sobre observabilidade e wide events, direto no seu email.
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <label htmlFor='newsletter-email' className={styles.label}>
          Email
        </label>
        <div className={styles.inputRow}>
          <input
            id='newsletter-email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='seu@email.com'
            className={styles.input}
            disabled={formState === 'loading'}
            aria-describedby={
              formState === 'invalid' ? 'newsletter-error'
              : formState === 'error'   ? 'newsletter-error'
              : undefined
            }
            required
          />
          <button
            type='submit'
            className={styles.button}
            disabled={formState === 'loading'}
            aria-busy={formState === 'loading'}
          >
            {formState === 'loading' ? 'Enviando…' : 'Inscrever'}
          </button>
        </div>

        {(formState === 'invalid' || formState === 'error') && (
          <p id='newsletter-error' className={styles.error} role='alert'>
            {formState === 'invalid'
              ? 'Email inválido. Verifique o endereço.'
              : 'Erro ao inscrever. Tente novamente.'}
          </p>
        )}
      </form>
    </div>
  );
}
```

**Acceptance criteria:**
- [ ] `'use client'` com comentário justificando
- [ ] `FormState` como union type explícito
- [ ] Validação client-side apenas como UX — não substitui server-side
- [ ] `role='status'` no success, `role='alert'` no erro
- [ ] `aria-describedby` conecta input ao erro
- [ ] `aria-busy` no botão durante loading
- [ ] `disabled` no input e botão durante loading
- [ ] CSS Module exclusivo
- [ ] `tsc --noEmit` passa

**Depends on:** T41

---

### T43 · Integrar trackEvent() nos eventos de blog
**Onda:** 7 | **Node:** N09.4 | **Agente:** Codex | **Prioridade:** MEDIUM

**Objetivo:** Integrar a função `trackEvent()` existente na LP nos eventos de blog sem criar nova camada de analytics.

**Pré-requisito:** Verificar a assinatura de `trackEvent` existente antes de integrar:
```bash
grep -rn "trackEvent\|export.*track" lib/ hooks/ --include="*.ts" --include="*.tsx"
```

**Eventos a rastrear:**
- `newsletter_subscribe` — em `BlogNewsletter` após POST 200
- `post_view` — em `app/blog/[slug]/page.tsx` via `incrementPostView`
- `cta_click_blog` — em `PostSidebar` quando clica no link de newsletter

**Acceptance criteria:**
- [ ] `trackEvent` importado do módulo existente da LP — não reimplementado
- [ ] Eventos com nomes snake_case consistentes
- [ ] `trackEvent` não bloqueia o fluxo principal (fire-and-forget com `.catch(console.warn)`)
- [ ] Zero PII nos payloads de evento (sem email, sem nome)
- [ ] `tsc --noEmit` passa

**ADR draft obrigatório se `trackEvent` não existir ou tiver assinatura incompatível.**

**Depends on:** T42

---

## STATUS TRACKER — FASE 3

| Task | Tipo | Onda | Status |
|------|------|------|--------|
| SRE-01 | SRE | 1 | `pending` |
| SRE-03 | SRE | 1 | `pending` |
| SRE-04 | SRE | 1 | `pending` |
| SRE-05 | SRE | 1 | `pending` |
| T44 | Funcional | 1 | `pending` |
| SRE-02 | SRE | 2 | `pending` ⚠️ deps unified |
| T32 | Funcional | 2 | `pending` |
| T37 | Funcional | 2 | `pending` |
| T34 | Funcional | 3 | `pending` |
| T36 | Funcional | 3 | `pending` |
| T38 | Funcional | 3 | `pending` |
| T39 | Claude Code | 3 | `pending` 🔒 |
| T33 | Funcional | 4 | `pending` |
| T40 | Funcional | 4 | `pending` |
| T35 | Funcional | 5 | `pending` |
| T41 | Funcional | 5 | `pending` 🔐 SRE-P1 |
| T42 | Funcional | 6 | `pending` |
| T43 | Funcional | 7 | `pending` |

---

## GATE DA FASE 3

```bash
# 1. TypeScript
npx tsc --noEmit
# Esperado: zero erros

# 2. Build
npm run build
# Esperado: ✓ Compiled successfully

# 3. Sitemap gerado
curl http://localhost:3000/sitemap.xml | grep '<url>'
# Esperado: /blog, /blog/wide-events-intro etc.

# 4. RSS válido
curl http://localhost:3000/api/blog/rss | grep '<item>'
# Esperado: 3+ items

# 5. OG dinâmica
curl "http://localhost:3000/api/blog/og?slug=wide-events-intro" -I
# Esperado: Content-Type: image/png, status 200

# 6. Newsletter com email inválido
curl -X POST http://localhost:3000/api/blog/newsletter \
  -H 'Content-Type: application/json' \
  -d '{"email":"invalido"}'
# Esperado: 422

# 7. Newsletter com email válido
curl -X POST http://localhost:3000/api/blog/newsletter \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","sourceSlug":"wide-events-intro"}'
# Esperado: 200 {"ok":true}

# 8. Auditoria SRE
grep -rn 'Function(code)' components/ | grep -v 'TRUST BOUNDARY'
# Esperado: zero linhas (toda ocorrência tem comentário de trust boundary)

grep -rn '<a href="/blog' components/ app/blog/
# Esperado: zero resultados

# 9. JSON-LD presente em post
curl http://localhost:3000/blog/wide-events-intro | grep 'application/ld+json'
# Esperado: uma ocorrência
```

---

## DELTA INTELLIGENCE — PREENCHER APÓS FASE 3

```
DIVERGÊNCIAS:
-

VIOLAÇÕES SRE:
-

CONSTRAINTS VIOLADAS:
-

PADRÕES EMERGENTES:
-

REFINAMENTOS PARA FASE 4:
-
```

---

*AGENTS.md · Fase 3 + SRE · Pantor Blog × LP*
*Gerado por Claude Code com base em HELIX.md v3.0 — 2026-05-22*