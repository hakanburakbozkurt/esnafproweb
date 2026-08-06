-- Dinamik fiyatlandırma planları (landing + admin)
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  segment text not null check (segment in ('esnaf', 'toptanci')),
  plan_key text not null,
  name text not null,
  description text,
  price_monthly numeric(10, 2) not null default 0,
  price_yearly numeric(10, 2) not null default 0,
  currency text not null default 'TRY',
  features jsonb not null default '[]'::jsonb,
  is_popular boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  cta_label text default 'Hemen Başla',
  cta_href text default '/giris',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_plans_segment_plan_key_key unique (segment, plan_key)
);

create index if not exists pricing_plans_segment_active_idx
  on public.pricing_plans (segment, is_active, sort_order);

comment on table public.pricing_plans is
  'Landing fiyatlandırma planları — Super Admin panelinden yönetilir';
