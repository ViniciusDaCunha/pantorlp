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
