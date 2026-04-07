# Pantor — Landing Page MVP

Landing Page de alta conversão para o SaaS Pantor. Construída com Next.js 15, TypeScript strict, Supabase e design system próprio.

## Stack

- **Framework**: Next.js 15 + TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Styling**: CSS Modules com design tokens (sem Tailwind)
- **Deploy**: Vercel

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencher em `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Configurar banco de dados

No Supabase SQL Editor, rodar o arquivo:

```bash
supabase/schema.sql
```

### 4. Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

## Estrutura do Projeto

```
pantor-lp/
├── app/
│   ├── globals.css          # Design tokens + reset global
│   ├── layout.tsx           # Root layout + SEO metadata
│   ├── page.tsx             # Landing page (lazy loading de seções)
│   └── admin/
│       ├── page.tsx         # Dashboard admin (protegido por senha)
│       └── admin.module.css
├── components/
│   ├── atoms/
│   │   ├── Button/          # Botão com variantes + loading state
│   │   └── LevelBadge/      # Badge de severidade de eventos
│   └── organisms/
│       ├── Navbar/          # Navegação fixa + mobile menu
│       ├── HeroSection/     # Hero + terminal animado de wide events
│       ├── ProblemsSection/ # Problemas do mercado + stats
│       ├── SolutionsSection/# Soluções Pantor + exemplos de código
│       ├── PricingCalculator/ # Planos + calculadora de economia
│       ├── WaitlistForm/    # Formulário de cadastro + validação
│       └── Footer/
├── hooks/
│   ├── useTerminalAnimation.ts  # Animação do terminal no hero
│   └── useWaitlistForm.ts       # Lógica do formulário + Supabase
├── lib/
│   └── supabase.ts          # Cliente Supabase + queries
├── types/
│   └── index.ts             # Tipos TypeScript centralizados
├── utils/
│   ├── validation.ts        # Validação de email (bloqueia descartáveis)
│   └── pricing.ts           # Cálculo de preços e comparativo
└── supabase/
    └── schema.sql           # DDL + RLS do banco
```

## Admin Dashboard

Acesse `/admin` com a senha configurada em `NEXT_PUBLIC_ADMIN_PASSWORD`.

**Métricas exibidas:**
- Total de visitantes únicos (por session_id)
- Total de leads na waitlist
- Taxa de conversão (leads / visitantes × 100)
- Gráfico de conversões por dia (30 dias)
- Top 5 roles dos leads

## Cálculo de Preços

O comparativo de preços usa os seguintes parâmetros de mercado (stack enterprise completa):

| Item | Custo |
|------|-------|
| Infra monitoring | US$ 15/host |
| APM / Tracing | US$ 31/host |
| Log ingestion | US$ 0,10/GB |
| Log indexing 15d | US$ 1,70/M eventos |
| Log indexing 30d | US$ 2,50/M eventos |

**Resultados por plano:**
| Plano | Pantor | Enterprise | Economia |
|-------|--------|------------|---------|
| Starter | R$ 75 | ~R$ 270 | ~72% |
| Growth | R$ 290 | ~R$ 564 | ~49% |
| Business | R$ 990 | ~R$ 1.530 | ~35% |

*USD a R$ 5,50. Estimativas baseadas em custos públicos de mercado.*
