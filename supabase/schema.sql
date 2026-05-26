-- ─── Pantor MVP - Supabase Schema ─────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Waitlist ──────────────────────────────────────────────────────────────────
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        text not null check (role in ('developer','tech-lead','cto','founder','other')),
  company     text,
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists idx_waitlist_created_at on public.waitlist(created_at desc);
create index if not exists idx_waitlist_role on public.waitlist(role);

-- RLS
alter table public.waitlist enable row level security;
-- Allow insert from anon (public waitlist signup)
create policy "allow_public_insert" on public.waitlist
  for insert to anon with check (true);
-- Deny all reads from anon
create policy "deny_public_select" on public.waitlist
  for select to anon using (false);

-- ─── Visitor Events ────────────────────────────────────────────────────────────
create table if not exists public.visitor_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null check (event_type in ('page_view','cta_click','form_start','form_submit')),
  session_id  text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_visitor_events_type on public.visitor_events(event_type);
create index if not exists idx_visitor_events_created on public.visitor_events(created_at desc);
create index if not exists idx_visitor_events_session on public.visitor_events(session_id);

alter table public.visitor_events enable row level security;
create policy "allow_public_insert_events" on public.visitor_events
  for insert to anon with check (true);
create policy "deny_public_select_events" on public.visitor_events
  for select to anon using (false);

-- GIN index for efficient JSONB metadata queries (plan CTA click filtering)
-- Required before plan_cta_clicks_by_plan() to avoid full table scans at volume
create index if not exists idx_visitor_events_metadata_gin
  on public.visitor_events using gin(metadata);

-- ─── Admin function: conversions_by_day ────────────────────────────────────────
create or replace function public.conversions_by_day()
returns table(date text, leads bigint)
language sql security definer
as $$
  select
    to_char(created_at::date, 'YYYY-MM-DD') as date,
    count(*) as leads
  from public.waitlist
  where created_at >= now() - interval '30 days'
  group by 1
  order by 1;
$$;

-- ─── Admin function: plan_cta_clicks_by_plan ───────────────────────────────────
-- Returns click counts per pricing plan — used to identify which plan
-- attracts the most interest before waitlist conversion.
-- No PII is stored: planName is a product attribute (e.g. "Starter"), never a user attribute.
create or replace function public.plan_cta_clicks_by_plan()
returns table(plan text, clicks bigint)
language sql security definer
as $$
  select
    metadata->>'plan'    as plan,
    count(*)             as clicks
  from public.visitor_events
  where event_type = 'cta_click'
    and metadata->>'plan' is not null
  group by 1
  order by 2 desc;
$$;

-- ─── Admin function: plan_cta_clicks_by_day ────────────────────────────────────
-- Time-series view: plan CTA clicks per day (last 30 days) for trend analysis.
create or replace function public.plan_cta_clicks_by_day()
returns table(date text, plan text, clicks bigint)
language sql security definer
as $$
  select
    to_char(created_at::date, 'YYYY-MM-DD') as date,
    metadata->>'plan'                        as plan,
    count(*)                                 as clicks
  from public.visitor_events
  where event_type = 'cta_click'
    and metadata->>'plan' is not null
    and created_at >= now() - interval '30 days'
  group by 1, 2
  order by 1, 2;
$$;

-- ─── Blog Newsletter ─────────────────────────────────────────────────────────
create table if not exists public.blog_newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  source_slug   text,
  subscribed_at timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists idx_blog_newsletter_subscribed_at
  on public.blog_newsletter_subscribers(subscribed_at desc);

create index if not exists idx_blog_newsletter_source_slug
  on public.blog_newsletter_subscribers(source_slug);

alter table public.blog_newsletter_subscribers enable row level security;
create policy "allow_public_insert_blog_newsletter" on public.blog_newsletter_subscribers
  for insert to anon with check (true);
create policy "deny_public_select_blog_newsletter" on public.blog_newsletter_subscribers
  for select to anon using (false);

-- ─── Blog Post Views ─────────────────────────────────────────────────────────
create table if not exists public.blog_post_views (
  slug       text primary key,
  views      bigint not null default 0 check (views >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_post_views_views
  on public.blog_post_views(views desc);

alter table public.blog_post_views enable row level security;
create policy "deny_public_select_blog_post_views" on public.blog_post_views
  for select to anon using (false);

create or replace function public.increment_post_view(p_slug text)
returns void
language plpgsql security definer
as $$
begin
  insert into public.blog_post_views(slug, views, updated_at)
  values (p_slug, 1, now())
  on conflict (slug)
  do update set
    views = public.blog_post_views.views + 1,
    updated_at = now();
end;
$$;
