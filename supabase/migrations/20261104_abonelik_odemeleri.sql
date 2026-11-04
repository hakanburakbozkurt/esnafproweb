-- Abonelik ödemeleri (İyzico tek seferlik 1/3/12 ay), 3 aylık fiyat ve Büyüme katmanı

-- 1) Büyüme katmanı: tier kısıtı free/pro/ultra idi, buyume eklenir
alter table public.dukkan_subscriptions
  drop constraint if exists dukkan_subscriptions_tier_check;
alter table public.dukkan_subscriptions
  add constraint dukkan_subscriptions_tier_check
  check (tier in ('free', 'buyume', 'pro', 'ultra'));

-- 2) 3 aylık fiyat (boşsa aylık x 3 kullanılır)
alter table public.pricing_plans
  add column if not exists price_quarterly numeric(10, 2)
  check (price_quarterly is null or price_quarterly >= 0);

-- 3) Ödeme kayıtları. Yazma yalnızca sunucu (service role); dükkan sahibi kendi kayıtlarını okur.
create table if not exists public.abonelik_odemeleri (
  id uuid primary key default gen_random_uuid(),
  dukkan_id uuid references public.dukkanlar (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  plan_key text not null check (plan_key in ('buyume', 'pro')),
  sure_ay integer not null check (sure_ay in (1, 3, 12)),
  tutar numeric(10, 2) not null check (tutar > 0),
  para_birimi text not null default 'TRY',
  durum text not null default 'beklemede'
    check (durum in ('beklemede', 'odendi', 'basarisiz')),
  conversation_id text not null unique,
  iyzico_token text unique,
  iyzico_payment_id text,
  hata_mesaji text,
  fatura_tipi text not null check (fatura_tipi in ('bireysel', 'kurumsal')),
  fatura_ad_unvan text not null,
  fatura_kimlik_no text not null,
  fatura_vergi_dairesi text,
  fatura_adres text not null,
  fatura_il text not null,
  fatura_ilce text not null,
  fatura_eposta text not null,
  fatura_telefon text not null,
  fatura_durumu text not null default 'bekliyor'
    check (fatura_durumu in ('bekliyor', 'kesildi')),
  fatura_no text,
  sozlesme_onay_at timestamptz not null,
  odeme_at timestamptz,
  abonelik_bitis_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.abonelik_odemeleri is
  'Esnaf abonelik ödemeleri (İyzico). Fatura bilgileri ödeme anında alınır; fatura_durumu admin tarafından güncellenir.';

create index if not exists abonelik_odemeleri_dukkan_idx
  on public.abonelik_odemeleri (dukkan_id, created_at desc);
create index if not exists abonelik_odemeleri_durum_idx
  on public.abonelik_odemeleri (durum, fatura_durumu, created_at desc);

alter table public.abonelik_odemeleri enable row level security;

drop policy if exists abonelik_odemeleri_select_owner on public.abonelik_odemeleri;
drop policy if exists abonelik_odemeleri_select_super_admin on public.abonelik_odemeleri;
drop policy if exists abonelik_odemeleri_update_super_admin on public.abonelik_odemeleri;

create policy abonelik_odemeleri_select_owner
  on public.abonelik_odemeleri
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy abonelik_odemeleri_select_super_admin
  on public.abonelik_odemeleri
  for select
  to authenticated
  using (public.is_platform_super_admin());

-- Admin yalnızca fatura alanlarını günceller (uygulama katmanında sınırlanır)
create policy abonelik_odemeleri_update_super_admin
  on public.abonelik_odemeleri
  for update
  to authenticated
  using (public.is_platform_super_admin())
  with check (public.is_platform_super_admin());

-- 4) Ödemeyi tamamla + aboneliği tek işlemde ata. Yalnızca service role çağırır.
create or replace function public.abonelik_odeme_tamamla(
  p_odeme_id uuid,
  p_iyzico_payment_id text
)
returns timestamptz
language plpgsql
set search_path = ''
as $$
declare
  v_odeme public.abonelik_odemeleri%rowtype;
  v_sub public.dukkan_subscriptions%rowtype;
  v_sub_var boolean;
  v_aktif boolean;
  v_baslangic timestamptz;
  v_bitis timestamptz;
  v_mevcut_sira integer;
  v_yeni_sira integer;
begin
  select * into v_odeme
  from public.abonelik_odemeleri
  where id = p_odeme_id
  for update;

  if not found then
    raise exception 'Ödeme kaydı bulunamadı';
  end if;

  -- Aynı callback iki kez gelirse ikinci kez süre eklenmez
  if v_odeme.durum = 'odendi' then
    return v_odeme.abonelik_bitis_at;
  end if;

  if v_odeme.durum <> 'beklemede' then
    raise exception 'Ödeme durumu uygun değil: %', v_odeme.durum;
  end if;

  if v_odeme.dukkan_id is null then
    raise exception 'Ödemeye bağlı dükkan yok';
  end if;

  select * into v_sub
  from public.dukkan_subscriptions
  where dukkan_id = v_odeme.dukkan_id
  for update;
  v_sub_var := found;

  v_aktif := v_sub_var
    and v_sub.tier <> 'free'
    and (v_sub.expires_at is null or v_sub.expires_at > now());

  v_mevcut_sira := case v_sub.tier when 'buyume' then 1 when 'pro' then 2 when 'ultra' then 3 else 0 end;
  v_yeni_sira := case v_odeme.plan_key when 'buyume' then 1 when 'pro' then 2 else 0 end;

  -- Daha yüksek aktif paket varken düşük paket atanmaz (ödeme sayfası bunu engeller; burası son kontrol)
  if v_aktif and v_mevcut_sira > v_yeni_sira then
    raise exception 'Daha yüksek bir paket aktif';
  end if;

  v_baslangic := now();
  -- Aynı paket uzatılıyorsa kalan süreye eklenir
  if v_aktif and v_sub.tier = v_odeme.plan_key and v_sub.expires_at is not null then
    v_baslangic := v_sub.expires_at;
  end if;
  v_bitis := v_baslangic + make_interval(months => v_odeme.sure_ay);

  insert into public.dukkan_subscriptions (dukkan_id, tier, expires_at, updated_at)
  values (v_odeme.dukkan_id, v_odeme.plan_key, v_bitis, now())
  on conflict (dukkan_id) do update
    set tier = excluded.tier,
        expires_at = excluded.expires_at,
        updated_at = now();

  update public.abonelik_odemeleri
  set durum = 'odendi',
      iyzico_payment_id = p_iyzico_payment_id,
      odeme_at = now(),
      abonelik_bitis_at = v_bitis,
      hata_mesaji = null,
      updated_at = now()
  where id = p_odeme_id;

  return v_bitis;
end;
$$;

revoke all on function public.abonelik_odeme_tamamla(uuid, text) from public;
revoke all on function public.abonelik_odeme_tamamla(uuid, text) from anon;
revoke all on function public.abonelik_odeme_tamamla(uuid, text) from authenticated;
grant execute on function public.abonelik_odeme_tamamla(uuid, text) to service_role;

-- 5) Başlangıç 3 aylık fiyatları (admin panelinden değiştirilebilir)
update public.pricing_plans set price_quarterly = 699 where segment = 'esnaf' and plan_key = 'buyume';
update public.pricing_plans set price_quarterly = 1399 where segment = 'esnaf' and plan_key = 'pro';
