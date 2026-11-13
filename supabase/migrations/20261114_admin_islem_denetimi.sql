-- Süper admin işlem denetimi: abonelik ödemeleri ve dükkan aboneliklerindeki
-- değişiklikler için değiştirilmeden önceki/sonraki değerleri kaydeder.
-- Kayıtları yalnızca platform süper adminleri okuyabilir.

create table if not exists public.admin_islem_kayitlari (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_user_id uuid,
  actor_email text,
  tablo text not null,
  kayit_id text,
  islem text not null check (islem in ('INSERT','UPDATE','DELETE')),
  eski_deger jsonb,
  yeni_deger jsonb,
  degisen_alanlar text[]
);

alter table public.admin_islem_kayitlari enable row level security;
revoke all on public.admin_islem_kayitlari from anon, authenticated;
grant select on public.admin_islem_kayitlari to authenticated;

drop policy if exists admin_islem_kayitlari_select_super_admin on public.admin_islem_kayitlari;
create policy admin_islem_kayitlari_select_super_admin
  on public.admin_islem_kayitlari for select to authenticated
  using (public.is_platform_super_admin());

create or replace function public.admin_islem_kaydet()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  eski jsonb := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  yeni jsonb := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;
  degisen text[];
  eposta text;
begin
  if tg_op = 'UPDATE' then
    select array_agg(e.key order by e.key) into degisen
    from jsonb_each(eski) e
    join jsonb_each(yeni) n using (key)
    where e.value is distinct from n.value;
  end if;

  select u.email into eposta from auth.users u where u.id = auth.uid();

  insert into public.admin_islem_kayitlari
    (actor_user_id, actor_email, tablo, kayit_id, islem, eski_deger, yeni_deger, degisen_alanlar)
  values (
    auth.uid(),
    eposta,
    tg_table_name,
    coalesce(yeni->>'id', eski->>'id', yeni->>'dukkan_id', eski->>'dukkan_id'),
    tg_op,
    eski,
    yeni,
    degisen
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists abonelik_odemeleri_admin_audit on public.abonelik_odemeleri;
create trigger abonelik_odemeleri_admin_audit
  after update on public.abonelik_odemeleri
  for each row execute function public.admin_islem_kaydet();

drop trigger if exists dukkan_subscriptions_admin_audit on public.dukkan_subscriptions;
create trigger dukkan_subscriptions_admin_audit
  after insert or update or delete on public.dukkan_subscriptions
  for each row execute function public.admin_islem_kaydet();
