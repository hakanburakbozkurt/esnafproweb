-- shop_slug_history: dükkan slug değişikliklerinde eski URL'lerin 301 yönlendirmesi için

create table if not exists public.shop_slug_history (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.stores (id) on delete cascade,
  old_slug text not null,
  created_at timestamptz not null default now(),
  constraint shop_slug_history_old_slug_unique unique (old_slug),
  constraint shop_slug_history_old_slug_format check (
    old_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create index if not exists shop_slug_history_shop_id_idx
  on public.shop_slug_history (shop_id);

comment on table public.shop_slug_history is
  'Dükkan slug değişikliklerinde eski vitrin URL''leri — 301 yönlendirme ve SEO koruması.';

alter table public.shop_slug_history enable row level security;

drop policy if exists shop_slug_history_select_public on public.shop_slug_history;
drop policy if exists shop_slug_history_insert_owner on public.shop_slug_history;

create policy shop_slug_history_select_public
  on public.shop_slug_history
  for select
  to anon, authenticated
  using (true);

create policy shop_slug_history_insert_owner
  on public.shop_slug_history
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.dukkanlar d
      where d.id = shop_slug_history.shop_id
        and d.user_id = auth.uid()
    )
  );

-- Tek sorguda eski slug → güncel aktif slug (middleware için)
create or replace function public.resolve_shop_slug_redirect(p_old_slug text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select d.slug
  from public.shop_slug_history h
  inner join public.dukkanlar d on d.id = h.shop_id
  where h.old_slug = lower(trim(p_old_slug))
    and d.aktif = true
    and d.slug <> lower(trim(p_old_slug))
  limit 1;
$$;

comment on function public.resolve_shop_slug_redirect(text) is
  'Eski dükkan slug''ı için güncel aktif slug döner; yönlendirme gerekmiyorsa null.';

grant execute on function public.resolve_shop_slug_redirect(text) to anon, authenticated;
