-- Uygulama stoğu (products) ↔ web vitrin ürünü (dukkan_urunleri) bağlantısı
--
-- Mobil uygulamadaki "Web'e aktar" bir stok ürününü vitrine kopyalar ve
-- dukkan_urunleri.product_id ile bağlar. Bağlı ürünün stok adedi bundan sonra
-- uygulamada değiştikçe (satış, toptancıdan teslim, elle düzeltme) web'de de
-- kendiliğinden güncellenir. Fiyat, açıklama ve görseller web'de serbestçe
-- düzenlenebilir; yalnızca stok adedi uygulamadan akar.
--
-- Not: web paneli ürünleri kaydederken dükkanın tüm ürünlerini silip yeniden
-- ekler (safeSyncDukkanUrunleri). product_id bu yüzden formda gizli alan olarak
-- taşınır; aksi halde her kayıtta bağlantı kopardı.

alter table public.dukkan_urunleri
  add column if not exists product_id uuid
    references public.products(id) on delete set null;

-- Bir stok ürünü en fazla bir vitrin ürününe bağlanabilir.
-- (UNIQUE birden fazla NULL'a izin verir; bağlı olmayan ürünler etkilenmez.)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'dukkan_urunleri_product_id_key'
      and conrelid = 'public.dukkan_urunleri'::regclass
  ) then
    alter table public.dukkan_urunleri
      add constraint dukkan_urunleri_product_id_key unique (product_id);
  end if;
end $$;

comment on column public.dukkan_urunleri.product_id is
  'Mobil uygulamadaki stok ürünü (products.id). Doluysa stok_adedi uygulamadan otomatik güncellenir.';

-- products.stock değişince bağlı vitrin ürününün stok_adedi'ni güncelle.
-- SECURITY DEFINER: tetikleyici, satışı yapan kullanıcının yetkisinden bağımsız
-- çalışsın diye. Yalnızca stok ürününün sahibiyle aynı kişiye ait dükkanlardaki
-- satırlara dokunur; başka dükkanın ürününü değiştiremez.
create or replace function public.sync_dukkan_urunu_stok_from_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.stock is distinct from old.stock then
    update public.dukkan_urunleri du
       set stok_adedi = greatest(coalesce(new.stock, 0), 0)
      from public.dukkanlar d
     where du.product_id = new.id
       and d.id = du.dukkan_id
       and d.user_id = new.user_id;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_dukkan_urunu_stok_from_product() from public, anon, authenticated;

drop trigger if exists trg_product_stock_to_dukkan_urunu on public.products;
create trigger trg_product_stock_to_dukkan_urunu
  after update of stock on public.products
  for each row
  execute function public.sync_dukkan_urunu_stok_from_product();
