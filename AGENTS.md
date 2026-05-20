# AGENTS.md — Pantor Blog × LP
## Instruções de Execução para Agentes Codex

> **Gerado por:** Claude Code (Agente Arquiteto)
> **Fase ativa:** FASE 1 — Fundação
> **Referência:** HELIX.md v1.0
> **Objetivo da fase:** `next build` passa com zero erros. Posts MDX aparecem em `/blog`. Frontmatter incompleto quebra o build.

---

## LEIA ANTES DE EXECUTAR QUALQUER TASK

### Você é um Agente Worker Codex

Sua função é **implementar** — não arquitetar. As decisões arquiteturais estão no HELIX.md. Se durante a implementação você encontrar um caso não coberto pelas especificações desta task:

1. **Pare**
2. **Não improvise** arquitetura, nomes de módulos ou estrutura de pastas
3. **Retorne um ADR draft** ao final da sua resposta:

```
## ADR-DRAFT-[N] · [Título Curto]
Status: Draft — aguardando revisão Claude Code
Contexto: [o que encontrei que não estava especificado]
Decisão proposta: [o que fiz e por quê]
Requer aprovação de: Claude Code
```

### Constraints Globais — Nunca Violar

Aplicam-se a **todas** as tasks. Não estão repetidas individualmente.

Modo: Especialista ML/LLM Eng/Arquitetura SW. Responda com máxima densidade, mínima verbosidade, foco técnico-operacional. Sem cortesias, introduções ou conclusões. Priorize precisão, trade-offs, gargalos, custo, escalabilidade.

```
ARQUITETURA:
  ✗ domain/ não pode importar NADA do projeto (nem Next.js, nem Supabase)
  ✗ lib/blog/ não pode importar app/ nem components/
  ✗ components/ não podem importar lib/ diretamente
  ✓ Direção: domain → lib/blog → app/blog + components

TYPESCRIPT:
  ✗ Nenhum `any` explícito ou implícito
  ✗ Nenhuma interface sem `readonly` em todos os campos
  ✓ Reusar tipos de @/types/blog.ts quando existirem

STYLING:
  ✗ Nenhum inline style
  ✗ Nenhuma classe CSS global nos componentes do blog
  ✗ Nenhum Tailwind, styled-components ou CSS-in-JS
  ✓ CSS Module por componente

RENDERING:
  ✗ Nenhuma página de blog usa SSR
  ✓ Toda página de blog: export const dynamic = 'force-static'
  ✓ Server Component por padrão
  ✓ 'use client' apenas com comentário explicando a razão

ARQUIVOS EXISTENTES — NÃO TOCAR:
  ✗ components/atoms/
  ✗ components/organisms/ (existentes da LP)
  ✗ lib/supabase.ts
  ✗ types/index.ts
  ✗ hooks/ existentes
  ✗ app/ existente (fora de app/blog/ e app/api/blog/)
```

---

## MAPA DE EXECUÇÃO — FASE 1

Tasks organizadas em ondas de paralelismo. Dentro de cada onda, todas rodam simultaneamente. Nenhuma task de uma onda inicia antes de todas as da onda anterior estarem concluídas.

```
ONDA 1 ─────────────────────────────────────────────────────────────
  T01  Criar estrutura de pastas                    [sem dependências]

ONDA 2 ─────────────────────────────────────────────────────────────
  T02  Instalar dependências npm                    [depende: T01]
  T03  Domain: entities.ts                          [depende: T01]
  T12* Segurança: remover NEXT_PUBLIC_ADMIN_PASSWORD [depende: T01]
       * Claude Code — não Codex

ONDA 3 ─────────────────────────────────────────────────────────────
  T04  Domain: value-objects.ts                     [depende: T03]

ONDA 4 ─────────────────────────────────────────────────────────────
  T05  Domain: repository.ts (IBlogRepository)      [depende: T04]
  T06  types/blog.ts                                [depende: T04]
  T09  lib/blog/reading-time.ts                     [depende: T04]

ONDA 5 ─────────────────────────────────────────────────────────────
  T07  contentlayer.config.ts                       [depende: T02, T03]

ONDA 6 ─────────────────────────────────────────────────────────────
  T08  next.config.ts — diff withContentlayer       [depende: T07]
  T11  Posts MDX seed (3 arquivos)                  [depende: T07]

ONDA 7 ─────────────────────────────────────────────────────────────
  T10  lib/blog/contentlayer.ts (IBlogRepository)   [depende: T05, T07, T09]

ONDA 8 ─────────────────────────────────────────────────────────────
  T13  app/blog/layout.tsx                          [depende: T10]

ONDA 9 ─────────────────────────────────────────────────────────────
  T14  app/blog/page.tsx  ← GATE DA FASE 1          [depende: T10, T13]
```

---

## TASKS — FASE 1

---

### T01 · Criar estrutura de pastas do blog
**Onda:** 1 | **Node:** N01 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Criar todas as pastas e arquivos de entrada necessários. Não cria implementação — apenas a estrutura que as tasks seguintes preenchem.

**Arquivos a criar:**

```
domain/blog/.gitkeep
lib/blog/.gitkeep
content/blog/.gitkeep
tests/blog/unit/.gitkeep
tests/blog/components/.gitkeep
tests/blog/e2e/.gitkeep
```

**Barrels vazios (TypeScript exige que os módulos existam):**

```typescript
// domain/blog/index.ts
export {};

// lib/blog/index.ts
export {};
```

**Placeholder de tipos:**

```typescript
// types/blog.ts
// Tipos de apresentação do módulo de blog.
// Entidades de domínio ficam em domain/blog/entities.ts
// Este arquivo é preenchido pela task T06.
export {};
```

**Acceptance criteria:**
- [ ] Todas as pastas existem
- [ ] Nenhum arquivo existente foi modificado
- [ ] `tsc --noEmit` continua passando

**Depends on:** nenhuma | **Bloqueia:** T02, T03, T12

---

### T02 · Instalar dependências npm
**Onda:** 2 | **Node:** N03.1 | **Agente:** Codex | **Prioridade:** BLOCKER

**Comandos exatos:**

```bash
npm install contentlayer next-contentlayer @next/mdx \
  rehype-pretty-code shiki rehype-slug rehype-autolink-headings \
  remark-gfm

npm install -D @types/mdx remark-lint
```

**Versões alvo:**

| Pacote | Versão |
|--------|--------|
| contentlayer | ^0.3.4 |
| next-contentlayer | ^0.3.4 |
| @next/mdx | ^15.0.0 |
| rehype-pretty-code | ^0.14.0 |
| shiki | ^1.0.0 |
| rehype-slug | ^6.0.0 |
| rehype-autolink-headings | ^7.0.0 |
| remark-gfm | ^4.0.0 |
| @types/mdx | ^2.0.0 (dev) |

**Acceptance criteria:**
- [ ] `npm install` conclui sem erros
- [ ] Todos os pacotes em `package.json`
- [ ] `tsc --noEmit` continua passando

**Depends on:** T01 | **Bloqueia:** T07

---

### T03 · Domain Layer — entities.ts
**Onda:** 2 | **Node:** N02.1 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Núcleo da Clean Architecture. Não importa nada do projeto — nem Next.js, nem Supabase, nem qualquer lib.

**Arquivo a criar:** `domain/blog/entities.ts`

```typescript
// domain/blog/entities.ts
// Camada de Domínio — zero dependências externas.
// Representa O QUE são as entidades, não como são persistidas ou renderizadas.

import type { ReadingTime, Slug, SocialLink, Tag } from './value-objects';

export interface BlogPost {
  readonly slug:        Slug;
  readonly title:       string;
  readonly description: string;
  readonly body:        string;         // MDX compilado — string de código JSX
  readonly author:      BlogAuthor;
  readonly category:    BlogCategory;
  readonly tags:        ReadonlyArray<Tag>;
  readonly publishedAt: Date;
  readonly updatedAt:   Date;
  readonly readingTime: ReadingTime;
  readonly featured:    boolean;
  readonly draft:       boolean;
  readonly ogImage:     string | null;
  readonly series:      BlogSeries | null;
}

export interface BlogAuthor {
  readonly slug:   string;
  readonly name:   string;
  readonly bio:    string;
  readonly avatar: string;
  readonly links:  ReadonlyArray<SocialLink>;
}

export interface BlogCategory {
  readonly slug:        string;
  readonly label:       string;
  readonly description: string;
}

export interface BlogSeries {
  readonly slug:  string;
  readonly title: string;
  readonly part:  number;
  readonly total: number;
}
```

**Acceptance criteria:**
- [ ] Arquivo importa apenas de `./value-objects` — nada mais
- [ ] Todos os campos são `readonly`
- [ ] `BlogPost.body` é `string` (não `React.ReactNode`)
- [ ] `BlogPost.series` é `BlogSeries | null`
- [ ] `BlogPost.ogImage` é `string | null`
- [ ] `tsc --noEmit` passa

**Depends on:** T01 | **Bloqueia:** T04

---

### T04 · Domain Layer — value-objects.ts
**Onda:** 3 | **Node:** N02.2 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Value objects com branded types. Garante que uma `string` qualquer não pode ser atribuída a `Slug` sem passar pelo smart constructor.

**Arquivo a criar:** `domain/blog/value-objects.ts`

```typescript
// domain/blog/value-objects.ts
// Branded types garantem invariantes em compile-time.
// Smart constructors são as únicas formas de criar Slug e Tag.
// Nenhuma dependência externa.

// ─── Branded Types ────────────────────────────────────────────────────────────
export type Slug = string & { readonly __brand: 'Slug' };
export type Tag  = string & { readonly __brand: 'Tag'  };

// ─── Value Objects Compostos ──────────────────────────────────────────────────
export interface ReadingTime {
  readonly minutes: number;
  readonly words:   number;
}

export interface SocialLink {
  readonly platform: 'twitter' | 'github' | 'linkedin' | 'website';
  readonly url:      string;
}

// ─── Smart Constructors ───────────────────────────────────────────────────────
export function createSlug(raw: string): Slug {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')  // substitui inválidos por hífen
    .replace(/-+/g, '-')           // colapsa múltiplos hífens
    .replace(/^-|-$/g, '');        // remove hífens nas bordas
  return slug as Slug;
}

export function createTag(raw: string): Tag {
  return raw.toLowerCase().trim() as Tag;
}
```

**Acceptance criteria:**
- [ ] `Slug` e `Tag` usam branded types com `__brand`
- [ ] `createSlug('Wide Events: Intro!')` → `'wide-events-intro-'`
- [ ] `createSlug('a--b---c')` → `'a-b-c'`
- [ ] `createTag('  OpenTelemetry  ')` → `'opentelemetry'`
- [ ] Arquivo não importa nada
- [ ] `tsc --noEmit` passa

**Depends on:** T03 | **Bloqueia:** T05, T06, T09

---

### T05 · Domain Layer — repository.ts (IBlogRepository)
**Onda:** 4 | **Node:** N02.3 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Contrato de acesso ao conteúdo. Ponto de extensão da Clean Architecture. Trocar Contentlayer por CMS headless não toca nenhuma página — apenas a implementação em `lib/blog/contentlayer.ts`.

**Arquivo a criar:** `domain/blog/repository.ts`

```typescript
// domain/blog/repository.ts
// IBlogRepository — contrato de acesso ao conteúdo do blog.
// ISP: define apenas o que os consumidores precisam.
// Implementação concreta em lib/blog/contentlayer.ts.

import type { BlogPost, BlogAuthor, BlogCategory } from './entities';
import type { Slug, Tag }                          from './value-objects';

export interface IBlogRepository {
  // ─── Leitura de posts ────────────────────────────────────────────────────
  // getAllPosts: todos (incluindo drafts — uso interno/admin)
  getAllPosts():                                       Promise<ReadonlyArray<BlogPost>>;
  // getPublishedPosts: draft:false, ordenados por publishedAt desc
  getPublishedPosts():                                 Promise<ReadonlyArray<BlogPost>>;
  // getPostBySlug: retorna null se não encontrar — nunca lança exceção
  getPostBySlug(slug: Slug):                          Promise<BlogPost | null>;
  // getFeaturedPosts: featured:true e draft:false
  getFeaturedPosts():                                  Promise<ReadonlyArray<BlogPost>>;

  // ─── Filtragem ───────────────────────────────────────────────────────────
  getPostsByCategory(categorySlug: string):            Promise<ReadonlyArray<BlogPost>>;
  getPostsByTag(tag: Tag):                             Promise<ReadonlyArray<BlogPost>>;
  // getRelatedPosts: exclui o post atual, prioriza mesma categoria + tags
  getRelatedPosts(post: BlogPost, limit: number):      Promise<ReadonlyArray<BlogPost>>;

  // ─── Metadados para generateStaticParams ─────────────────────────────────
  getAllSlugs():       Promise<ReadonlyArray<Slug>>;
  getAllCategories():  Promise<ReadonlyArray<BlogCategory>>;
  getAllTags():        Promise<ReadonlyArray<Tag>>;
  getAllAuthors():     Promise<ReadonlyArray<BlogAuthor>>;
}
```

**Acceptance criteria:**
- [ ] Interface exportada exatamente como `IBlogRepository`
- [ ] `getPostBySlug` retorna `Promise<BlogPost | null>` — não lança
- [ ] Todos os retornos de lista são `ReadonlyArray`
- [ ] Zero referências a Contentlayer, Supabase, Next.js ou libs externas
- [ ] `tsc --noEmit` passa

**Depends on:** T04 | **Bloqueia:** T10

---

### T06 · Criar types/blog.ts
**Onda:** 4 | **Node:** N02 | **Agente:** Codex | **Prioridade:** HIGH

**Objetivo:** Tipos de apresentação — distintos das entidades de domínio. `BlogPostSummary` não tem `body` (evita carregar MDX compilado em listas).

**Arquivo a modificar:** `types/blog.ts` (substituir o placeholder criado em T01)

```typescript
// types/blog.ts
// Tipos de apresentação e API do blog.
// OCP: types/index.ts (existente) não é modificado.

// ─── Frontmatter validado pelo Contentlayer ──────────────────────────────────
export interface PostFrontmatter {
  readonly title:       string;
  readonly description: string;
  readonly author:      string;
  readonly category:    string;
  readonly tags:        string[];
  readonly publishedAt: string;         // ISO 8601
  readonly updatedAt?:  string;
  readonly featured?:   boolean;
  readonly draft?:      boolean;
  readonly ogImage?:    string;
  readonly seriesSlug?: string;
  readonly seriesPart?: number;
}

// ─── Versão resumida para listagens (sem body) ───────────────────────────────
export interface BlogPostSummary {
  readonly slug:        string;
  readonly title:       string;
  readonly description: string;
  readonly publishedAt: string;
  readonly readingTime: number;         // minutos
  readonly category:    string;
  readonly tags:        string[];
  readonly author:      string;
}

// ─── Props de componentes ────────────────────────────────────────────────────
export interface PostCardProps {
  readonly post:     BlogPostSummary;
  readonly variant?: 'default' | 'featured' | 'compact';
}

// ─── Paginação ───────────────────────────────────────────────────────────────
export interface PaginationParams {
  readonly page:     number;
  readonly pageSize: number;
}

export interface PaginatedPosts {
  readonly posts:      ReadonlyArray<BlogPostSummary>;
  readonly total:      number;
  readonly page:       number;
  readonly totalPages: number;
}

// ─── Parâmetros de rota (generateStaticParams) ───────────────────────────────
export type BlogSlugParams     = { slug:      string };
export type BlogCategoryParams = { categoria: string };
export type BlogTagParams      = { tag:       string };
```

**Acceptance criteria:**
- [ ] `BlogPostSummary` não tem campo `body`
- [ ] `PostCardProps.variant` tem exatamente: `'default' | 'featured' | 'compact'`
- [ ] Todos os campos obrigatórios têm `readonly`
- [ ] `types/index.ts` existente não foi modificado
- [ ] `tsc --noEmit` passa

**Depends on:** T04 | **Bloqueia:** T23 (Fase 2), T25, T26

---

### T07 · Criar contentlayer.config.ts
**Onda:** 5 | **Node:** N03.2 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Pipeline de conteúdo MDX. Frontmatter inválido (campo obrigatório ausente) deve quebrar o build com mensagem clara. Slug derivado do caminho do arquivo — não do frontmatter.

**Arquivo a criar:** `contentlayer.config.ts` (raiz do projeto — mesmo nível de `next.config.ts`)

```typescript
// contentlayer.config.ts
// Pipeline MDX com validação de frontmatter em TypeScript.
// Slug é computedField derivado do caminho — Single Source of Truth.

import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypePrettyCode                   from 'rehype-pretty-code';
import remarkGfm                          from 'remark-gfm';
import rehypeSlug                         from 'rehype-slug';
import rehypeAutolinkHeadings             from 'rehype-autolink-headings';

export const Post = defineDocumentType(() => ({
  name:            'Post',
  filePathPattern: 'blog/**/*.mdx',
  contentType:     'mdx',

  fields: {
    // Obrigatórios — build falha se ausentes
    title:       { type: 'string',  required: true  },
    description: { type: 'string',  required: true  },
    author:      { type: 'string',  required: true  },
    category:    { type: 'string',  required: true  },
    tags:        { type: 'list',    required: true,  of: { type: 'string' } },
    publishedAt: { type: 'date',    required: true  },
    // Opcionais
    updatedAt:   { type: 'date',    required: false },
    featured:    { type: 'boolean', required: false, default: false },
    draft:       { type: 'boolean', required: false, default: false },
    ogImage:     { type: 'string',  required: false },
    seriesSlug:  { type: 'string',  required: false },
    seriesPart:  { type: 'number',  required: false },
  },

  computedFields: {
    slug: {
      type:    'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('blog/', ''),
    },
    url: {
      type:    'string',
      resolve: (doc) => `/blog/${doc._raw.flattenedPath.replace('blog/', '')}`,
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes:  [Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [rehypePrettyCode, {
        theme:          'one-dark-pro',
        keepBackground: false,
        onVisitLine(node: { children: unknown[] }) {
          if (node.children.length === 0) {
            node.children = [{ type: 'text', value: ' ' }];
          }
        },
      }],
    ],
  },
}));
```

**Acceptance criteria:**
- [ ] Arquivo na raiz do projeto (não em `lib/` nem `src/`)
- [ ] Campos `title`, `description`, `author`, `category`, `tags`, `publishedAt` são `required: true`
- [ ] `slug` é computedField derivado de `_raw.flattenedPath`
- [ ] Tema Shiki: `one-dark-pro`
- [ ] `tsc --noEmit` passa

**Depends on:** T02, T03 | **Bloqueia:** T08, T10, T11

---

### T08 · Atualizar next.config.ts — diff withContentlayer
**Onda:** 6 | **Node:** N03 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Integrar Contentlayer ao Next.js. **Diff mínimo** — apenas as 3 linhas necessárias. Nenhuma config existente é alterada ou removida.

**Mudanças exatas a aplicar:**

```diff
// Linha 1 — adicionar import:
+ import { withContentlayer } from 'next-contentlayer';

// Dentro do objeto nextConfig — adicionar:
+ pageExtensions: ['ts', 'tsx', 'mdx'],

// Última linha — alterar export:
- export default nextConfig;
+ export default withContentlayer(nextConfig);
```

**Resultado esperado (estrutura, não o arquivo completo):**

```typescript
import type { NextConfig }  from 'next';
import { withContentlayer } from 'next-contentlayer';  // NOVO

const nextConfig: NextConfig = {
  // ... configs existentes intactas ...
  pageExtensions: ['ts', 'tsx', 'mdx'],  // NOVO
};

export default withContentlayer(nextConfig);  // ALTERADO
```

**Acceptance criteria:**
- [ ] Exatamente 3 mudanças: 1 import, 1 campo, 1 export
- [ ] Nenhuma configuração existente removida ou alterada
- [ ] `tsc --noEmit` passa

**Depends on:** T07 | **Bloqueia:** T14 (build final)

---

### T09 · Criar lib/blog/reading-time.ts
**Onda:** 4 | **Node:** N04.1 | **Agente:** Codex | **Prioridade:** HIGH

**Objetivo:** Função pura de estimativa de tempo de leitura. Sem dependências, sem efeitos colaterais, testável sem mocks.

**Arquivo a criar:** `lib/blog/reading-time.ts`

```typescript
// lib/blog/reading-time.ts
// Função pura — entrada determinística, saída determinística.
// Testável sem mocks. Sem dependências externas.

import type { ReadingTime } from '@/domain/blog/value-objects';

// Média de leitura para conteúdo técnico (Nielsen Norman Group)
const WORDS_PER_MINUTE = 200;

export function computeReadingTime(rawContent: string): ReadingTime {
  const words   = rawContent.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, words };
}
```

**Acceptance criteria:**
- [ ] `computeReadingTime('')` → `{ minutes: 1, words: 0 }` (sem lançar erro)
- [ ] 200 palavras → `{ minutes: 1, words: 200 }`
- [ ] 201 palavras → `{ minutes: 2, words: 201 }` (ceil)
- [ ] `WORDS_PER_MINUTE = 200` como constante nomeada (não magic number)
- [ ] `tsc --noEmit` passa

**Depends on:** T04 | **Bloqueia:** T10

---

### T10 · Criar lib/blog/contentlayer.ts (implementação IBlogRepository)
**Onda:** 7 | **Node:** N04.2 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Única camada que sabe que posts vêm de MDX. Implementa `IBlogRepository`. Páginas dependem da interface — não desta classe.

**Arquivo a criar:** `lib/blog/contentlayer.ts`

```typescript
// lib/blog/contentlayer.ts
// Implementação de IBlogRepository usando Contentlayer como fonte de dados.
// DIP: páginas importam IBlogRepository (domínio), não esta classe (infra).
// Se o Contentlayer mudar, apenas este arquivo muda.

import { allPosts }                    from 'contentlayer/generated';
import type { IBlogRepository }        from '@/domain/blog/repository';
import type { BlogAuthor, BlogCategory, BlogPost } from '@/domain/blog/entities';
import { createSlug, createTag }       from '@/domain/blog/value-objects';
import { computeReadingTime }          from './reading-time';

// ─── Fontes de verdade de autores e categorias ────────────────────────────────
// Posts referenciam pelo slug — resolvido aqui no mapeamento.
export const AUTHORS: Record<string, BlogAuthor> = {
  'pantor-team': {
    slug:   'pantor-team',
    name:   'Time Pantor',
    bio:    'Engenharia e produto da Pantor — plataforma de observabilidade baseada em wide events.',
    avatar: '/authors/pantor-team.png',
    links:  [
      { platform: 'github',   url: 'https://github.com/pantor-dev'       },
      { platform: 'linkedin', url: 'https://linkedin.com/company/pantor' },
    ],
  },
};

export const CATEGORIES: ReadonlyArray<BlogCategory> = [
  { slug: 'wide-events',     label: 'Wide Events',     description: 'Eventos contextuais e observabilidade moderna'      },
  { slug: 'observabilidade', label: 'Observabilidade', description: 'Monitoring, tracing e logging na prática'          },
  { slug: 'opentelemetry',   label: 'OpenTelemetry',   description: 'Instrumentação e coleta de telemetria'             },
  { slug: 'engenharia',      label: 'Engenharia',      description: 'Boas práticas de desenvolvimento de software'      },
];

// ─── Função de mapeamento ─────────────────────────────────────────────────────
// Isolamento: se o schema do Contentlayer mudar, apenas esta função muda.
function toDomainPost(raw: typeof allPosts[number]): BlogPost {
  const author   = AUTHORS[raw.author] ?? AUTHORS['pantor-team'];
  const category = CATEGORIES.find(c => c.slug === raw.category) ?? CATEGORIES[0];

  return {
    slug:        createSlug(raw.slug),
    title:       raw.title,
    description: raw.description,
    body:        raw.body.code,
    author,
    category,
    tags:        raw.tags.map(createTag),
    publishedAt: new Date(raw.publishedAt),
    updatedAt:   new Date(raw.updatedAt ?? raw.publishedAt),
    readingTime: computeReadingTime(raw.body.raw),
    featured:    raw.featured ?? false,
    draft:       raw.draft    ?? false,
    ogImage:     raw.ogImage  ?? null,
    // DT-06: series.total hardcoded como 1 — corrigir na v2
    series: raw.seriesSlug
      ? { slug: raw.seriesSlug, title: raw.seriesSlug, part: raw.seriesPart ?? 1, total: 1 }
      : null,
  };
}

// ─── Implementação ────────────────────────────────────────────────────────────
class ContentlayerBlogRepository implements IBlogRepository {
  async getAllPosts() {
    return allPosts.map(toDomainPost);
  }

  async getPublishedPosts() {
    return allPosts
      .filter(post => !post.draft)
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .map(toDomainPost);
  }

  async getPostBySlug(slug) {
    const raw = allPosts.find(post => post.slug === slug);
    return raw ? toDomainPost(raw) : null;
  }

  async getFeaturedPosts() {
    return allPosts
      .filter(post => post.featured && !post.draft)
      .map(toDomainPost);
  }

  async getPostsByCategory(categorySlug) {
    return allPosts
      .filter(post => post.category === categorySlug && !post.draft)
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .map(toDomainPost);
  }

  async getPostsByTag(tag) {
    return allPosts
      .filter(post => post.tags.includes(tag) && !post.draft)
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .map(toDomainPost);
  }

  async getRelatedPosts(post, limit = 3) {
    const categorySlug = (post.category as BlogCategory).slug;
    return allPosts
      .filter(candidate =>
        candidate.slug !== (post.slug as string) &&
        !candidate.draft &&
        (candidate.category === categorySlug ||
         candidate.tags.some(tag => (post.tags as string[]).includes(tag)))
      )
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .slice(0, limit)
      .map(toDomainPost);
  }

  async getAllSlugs() {
    return allPosts
      .filter(post => !post.draft)
      .map(post => createSlug(post.slug));
  }

  async getAllCategories() {
    return CATEGORIES;
  }

  async getAllTags() {
    const tagSet = new Set(allPosts.flatMap(post => post.tags));
    return [...tagSet].map(createTag);
  }

  async getAllAuthors() {
    return Object.values(AUTHORS);
  }
}

// Singleton exportado como interface — não como classe concreta
export const blogRepository: IBlogRepository = new ContentlayerBlogRepository();
```

**Acceptance criteria:**
- [ ] Implementa todos os métodos de `IBlogRepository` sem erro de tipo
- [ ] `getPublishedPosts` filtra `draft: true` e ordena por `publishedAt` desc
- [ ] `getPostBySlug` retorna `null` para slug inexistente
- [ ] `getRelatedPosts` exclui o post atual
- [ ] `blogRepository` exportado tipado como `IBlogRepository`
- [ ] `tsc --noEmit` passa

**Depends on:** T05, T07, T09 | **Bloqueia:** T13, T14

---

### T11 · Criar posts MDX seed (3 arquivos)
**Onda:** 6 | **Node:** N03.6 | **Agente:** Codex | **Prioridade:** HIGH

**Objetivo:** Criar os 3 primeiros posts reais do blog. Validam o pipeline MDX end-to-end e serão o conteúdo inicial em produção.

**Arquivo 1:** `content/blog/wide-events-intro.mdx`

```markdown
---
title: "O que são Wide Events e por que substituem logs isolados"
description: "Wide events capturam o contexto completo de uma requisição em um único evento estruturado. Entenda por que isso muda como você observa produção."
author: "pantor-team"
category: "wide-events"
tags:
  - wide-events
  - observabilidade
  - opentelemetry
publishedAt: "2025-04-01"
featured: true
draft: false
---

## O problema com logs isolados

Quando um usuário reporta lentidão, a investigação típica começa assim: abrir o painel de métricas,
depois os logs de aplicação, depois os traces — cada sistema em uma aba diferente, cada um com
seu próprio formato, cada um com parte do contexto.

Wide events resolvem isso capturando tudo em um único evento estruturado no momento em que acontece.

## O que é um wide event

Um wide event é um evento estruturado que carrega o contexto completo de uma operação.
Em vez de emitir `request received`, `db query start`, `db query end` como eventos separados,
você emite um único evento com todos esses campos:

```json
{
  "trace_id": "abc123",
  "endpoint": "POST /api/checkout",
  "duration_ms": 342,
  "db_queries": 3,
  "db_duration_ms": 180,
  "cache_hits": 2,
  "status_code": 200
}
```

## Por que isso importa para observabilidade

Com eventos isolados, reconstruir o contexto de um incidente requer correlação manual entre
sistemas diferentes. Com wide events, a resposta para "o que aconteceu nesta requisição"
está em um único lugar.

A Pantor foi construída em torno deste princípio.
```

**Arquivo 2:** `content/blog/observabilidade-vs-monitoramento.mdx`

```markdown
---
title: "Observabilidade vs Monitoramento: qual a diferença real"
description: "Monitoramento te diz se algo está errado. Observabilidade te diz por quê. Entenda a distinção e por que ela importa para times de produção modernos."
author: "pantor-team"
category: "observabilidade"
tags:
  - observabilidade
  - monitoramento
  - sre
publishedAt: "2025-04-08"
featured: false
draft: false
---

## A distinção fundamental

Monitoramento responde perguntas que você formulou antes do problema acontecer.
Você configura alertas para métricas conhecidas — CPU acima de 80%, latência acima de 500ms.

Observabilidade responde perguntas que você ainda não sabia que precisaria fazer.
Quando um novo tipo de falha ocorre — e sempre ocorre — você consegue investigar sem
precisar redeploy com mais instrumentação.

## Os três pilares e seu limite

A narrativa popular fala em logs, métricas e traces como os três pilares da observabilidade.
Mas pilares são estruturas independentes. Observabilidade real precisa de correlação.

Wide events são a resposta: em vez de três fluxos separados para correlacionar depois,
você captura contexto correlacionado na origem.

## O que isso significa na prática

Um time com boa observabilidade consegue responder:

- Qual percentual de requisições lentas vieram de usuários no plano gratuito?
- Quais deploys correlacionam com aumento de erros 5xx?
- Qual feature flag está associada a maior latência de banco?

Essas perguntas requerem contexto — não apenas métricas isoladas.
```

**Arquivo 3:** `content/blog/opentelemetry-primeiros-passos.mdx`

```markdown
---
title: "OpenTelemetry em produção: primeiros passos sem dor"
description: "Guia prático para instrumentar uma aplicação Node.js com OpenTelemetry sem precisar reescrever seu código."
author: "pantor-team"
category: "opentelemetry"
tags:
  - opentelemetry
  - nodejs
  - instrumentacao
publishedAt: "2025-04-15"
featured: false
draft: false
seriesSlug: "guia-observabilidade"
seriesPart: 1
---

## Por que OpenTelemetry

OpenTelemetry é o padrão aberto para instrumentação — mantido pela CNCF, com suporte
de todos os grandes vendors de observabilidade. Instrumentar com OTel significa que
você pode trocar o backend sem reescrever a instrumentação.

## Instalação mínima para Node.js

```bash
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-otlp-http
```

## Configuração básica

```typescript
// instrumentation.ts — carregado antes de qualquer outro módulo
import { NodeSDK }                     from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter }           from '@opentelemetry/exporter-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

## O que você ganha imediatamente

Com auto-instrumentação ativada, você passa a ter traces automáticos de:

- HTTP (req/res, headers, status codes)
- Banco de dados (queries, duration, connection pool)
- Redis/cache
- Propagação de contexto entre serviços

Sem escrever uma linha de instrumentação manual.
```

**Acceptance criteria:**
- [ ] Os 3 arquivos existem em `content/blog/`
- [ ] Todos têm frontmatter completo com todos os campos obrigatórios
- [ ] `featured: true` em pelo menos 1 post (`wide-events-intro`)
- [ ] `draft: false` em todos os posts
- [ ] Pelo menos 1 post tem bloco de código com syntax highlighting
- [ ] `next build` processa os 3 posts sem erro de frontmatter

**Depends on:** T07 | **Bloqueia:** (nenhuma — finaliza pipeline de conteúdo)

---

### T13 · Criar app/blog/layout.tsx
**Onda:** 8 | **Node:** N05.5 | **Agente:** Codex | **Prioridade:** HIGH

**Objetivo:** Layout raiz do blog. Server Component. Compartilhado por todas as rotas `/blog/*`.

**Arquivo a criar:** `app/blog/layout.tsx`

```typescript
// app/blog/layout.tsx — Server Component
// Layout compartilhado por todas as rotas do blog.
// Sem 'use client' — não tem interatividade própria.
import type { Metadata } from 'next';
import styles            from './blog.module.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Pantor Blog',
    default:  'Blog | Pantor',
  },
};

interface BlogLayoutProps {
  readonly children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className={styles.blogRoot}>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
```

**Arquivo a criar:** `app/blog/blog.module.css`

```css
/* app/blog/blog.module.css */
.blogRoot {
  min-height: 100vh;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
```

**Acceptance criteria:**
- [ ] Server Component (sem `'use client'`)
- [ ] `metadata.title.template` configurado como `'%s | Pantor Blog'`
- [ ] CSS Module criado — zero inline style
- [ ] `tsc --noEmit` passa

**Depends on:** T10 | **Bloqueia:** T14

---

### T14 · Criar app/blog/page.tsx — GATE DA FASE 1
**Onda:** 9 | **Node:** N05.1 | **Agente:** Codex | **Prioridade:** BLOCKER

**Objetivo:** Página de listagem do blog. Gate final da Fase 1 — quando `next build` passar com esta task concluída, a fase está completa. Usa card mínimo (PostList organism completo é criado na Fase 2).

**Arquivo a criar:** `app/blog/page.tsx`

```typescript
// app/blog/page.tsx — Server Component (SSG)
// force-static: HTML gerado em build time, nunca em runtime.
// PostList organism completo criado na Fase 2 (T25).
// Esta implementação é o card mínimo para validar o pipeline.
import type { Metadata }  from 'next';
import { blogRepository } from '@/lib/blog/contentlayer';
import styles             from './page.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pantor.dev';

export const dynamic    = 'force-static';
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       'Blog — Observabilidade e Wide Events',
    description: 'Artigos técnicos sobre observabilidade, wide events, OpenTelemetry e desenvolvimento contínuo para times modernos.',
    alternates:  { canonical: `${SITE_URL}/blog` },
    openGraph: {
      type:   'website',
      url:    `${SITE_URL}/blog`,
      title:  'Blog Técnico — Pantor',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function BlogPage() {
  const posts = await blogRepository.getPublishedPosts();

  return (
    <section
      className={styles.container}
      aria-label='Lista de artigos do blog'
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'} sobre
          observabilidade, wide events e desenvolvimento contínuo.
        </p>
      </header>

      <ul className={styles.list} role='list'>
        {posts.map(post => (
          // TODO Fase 2 (T25): substituir por <PostList posts={posts} />
          <li key={post.slug as string}>
            <article aria-label={post.title}>
              <h2>
                <a href={`/blog/${post.slug as string}`}>{post.title}</a>
              </h2>
              <p>{post.description}</p>
              <time dateTime={post.publishedAt.toISOString()}>
                {post.publishedAt.toLocaleDateString('pt-BR')}
              </time>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**Arquivo a criar:** `app/blog/page.module.css`

```css
/* app/blog/page.module.css */
.container {
  padding: 2rem 0;
}

.header {
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: var(--color-text-muted, #6b7280);
  margin: 0;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 2rem;
}
```

**Acceptance criteria:**
- [ ] `export const dynamic = 'force-static'` presente
- [ ] Usa `blogRepository.getPublishedPosts()` — não acessa `allPosts` diretamente
- [ ] `generateMetadata` exportado com title, description e openGraph
- [ ] `<section aria-label='Lista de artigos do blog'>` como wrapper semântico
- [ ] **`next build` conclui com zero erros** ← GATE DA FASE 1
- [ ] Os 3 posts seed aparecem renderizados em `/blog`
- [ ] HTML gerado em `.next/server/app/blog/page.html`

**Depends on:** T10, T13 | **Bloqueia:** GATE FASE 1

---

## TASK RESERVADA — CLAUDE CODE

### T12 · [CLAUDE CODE] Corrigir NEXT_PUBLIC_ADMIN_PASSWORD
**Onda:** 2 | **Node:** N11.1 | **Agente:** CLAUDE CODE — não delegar | **Prioridade:** CRÍTICO

**Esta task requer julgamento arquitetural e acesso a variáveis de ambiente. Não é delegada ao Codex.**

**Protocolo de execução:**

```bash
# Passo 1 — identificar todas as ocorrências
grep -rn "NEXT_PUBLIC_ADMIN_PASSWORD" . \
  --include="*.ts" --include="*.tsx" \
  --include="*.env" --include="*.env.*" \
  --include="*.example"
```

**Ações sequenciais:**
1. Remover `NEXT_PUBLIC_ADMIN_PASSWORD` de todos os arquivos encontrados
2. Criar `ADMIN_PASSWORD` (sem prefixo) no `.env.local` e documentar no `.env.example`
3. Criar `app/api/admin/auth/route.ts` com validação server-side
4. Criar/atualizar `middleware.ts` com proteção de rotas `/admin/*` via cookie `httpOnly`
5. Criar `app/admin/login/page.tsx`

**Acceptance criteria:**
- [ ] `grep -r "NEXT_PUBLIC_ADMIN_PASSWORD" .` retorna zero resultados
- [ ] Cookie `admin-session`: `httpOnly: true, secure: true, sameSite: 'strict'`
- [ ] Rotas `/admin/*` protegidas no middleware
- [ ] `.env.example` atualizado sem valores reais

**Depends on:** T01 | **Bloqueia:** deploy em produção

---

## STATUS TRACKER — FASE 1

| Task | Descrição | Onda | Agente | Status |
|------|-----------|------|--------|--------|
| T01 | Estrutura de pastas | 1 | Codex | `pending` |
| T02 | Instalar npm | 2 | Codex | `pending` |
| T03 | entities.ts | 2 | Codex | `pending` |
| T04 | value-objects.ts | 3 | Codex | `pending` |
| T05 | repository.ts | 4 | Codex | `pending` |
| T06 | types/blog.ts | 4 | Codex | `pending` |
| T07 | contentlayer.config.ts | 5 | Codex | `pending` |
| T08 | next.config.ts diff | 6 | Codex | `pending` |
| T09 | reading-time.ts | 4 | Codex | `pending` |
| T10 | contentlayer.ts (impl) | 7 | Codex | `pending` |
| T11 | Posts MDX seed | 6 | Codex | `pending` |
| T12 | NEXT_PUBLIC fix | 2 | **Claude Code** | `pending` 🔐 |
| T13 | blog/layout.tsx | 8 | Codex | `pending` |
| T14 | blog/page.tsx | 9 | Codex | `pending` 🏁 |

**Status possíveis:** `pending` · `in-progress` · `done` · `blocked`

---

## GATE DA FASE 1 — CRITÉRIOS DE CONCLUSÃO

```bash
# 1. Zero erros TypeScript
npx tsc --noEmit
# Esperado: saída vazia (zero erros)

# 2. Build bem-sucedido
npm run build
# Esperado: ✓ Compiled successfully

# 3. HTML estático gerado para os 3 posts
ls .next/server/app/blog/
# Esperado: page.html, wide-events-intro/, observabilidade-vs-monitoramento/, opentelemetry-primeiros-passos/

# 4. Vulnerabilidade corrigida
grep -r "NEXT_PUBLIC_ADMIN_PASSWORD" . --include="*.ts" --include="*.tsx"
# Esperado: zero resultados

# 5. Frontmatter inválido quebra o build
# Teste manual: criar post sem campo `title`, rodar `next build`
# Esperado: erro claro sobre campo obrigatório ausente
```

---

## DELTA INTELLIGENCE — PREENCHER APÓS FASE 1

Claude Code preenche após todas as tasks concluídas:

```
DIVERGÊNCIAS ENCONTRADAS:
- 

CONSTRAINTS VIOLADAS (mesmo que o build passe):
- 

PADRÕES EMERGENTES NÃO ESPECIFICADOS:
- 

REFINAMENTOS PARA AGENTS.md — FASE 2:
- 
```

---

