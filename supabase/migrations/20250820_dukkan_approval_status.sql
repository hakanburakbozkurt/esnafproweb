-- dukkanlar: onay statüsü (active | pending | rejected)

do $$
begin
  create type public.shop_approval_status as enum ('active', 'pending', 'rejected');
exception
  when duplicate_object then null;
end $$;

alter table public.dukkanlar
  add column if not exists approval_status public.shop_approval_status not null default 'pending';

comment on column public.dukkanlar.approval_status is
  'Dükkan onay durumu — yalnızca active vitrinler arama motorlarına indexlenir.';

-- Mevcut kayıtlar canlı kabul edilir; yeni dükkanlar pending ile başlar
update public.dukkanlar
set approval_status = 'active'
where approval_status = 'pending';

create index if not exists dukkanlar_approval_status_idx
  on public.dukkanlar (approval_status);

-- resolve_shop_slug_redirect: yalnızca onaylı aktif vitrinlere yönlendir
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
    and d.approval_status = 'active'
    and d.slug <> lower(trim(p_old_slug))
  limit 1;
$$;
