-- Landing (esnafpro.app) SSS — Super Admin panelinden yönetilir
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  soru text not null,
  cevap text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_active_sort_idx
  on public.faqs (is_active, sort_order);

comment on table public.faqs is
  'EsnafPRO ana sayfa SSS — soru, cevap ve sıra';
