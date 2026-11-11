-- Cihaz ilanı (2. el / sıfır) web adresi otomatik ve benzersiz olsun.
--
-- Sorun: mobil uygulamadan yayınlanan ilanlarda web_slug boş kalıyordu; vitrin ve
-- sitemap bu durumda "/pazaryeri/428e2e8a-…" gibi anlamsız bir adres üretiyordu.
-- Ayrıca web_slug tüm tabloda benzersiz, ama web tarafı yalnızca kendi
-- ilanlarında çakışma arıyordu; iki dükkan aynı modeli yayınlayınca hata alabilirdi.
--
-- Çözüm: yayındaki ilanın slug'ı boşsa "marka-model-kapasite-ikinci-el|sifir"
-- olarak üretilir; başka ilanla çakışırsa sonuna -2, -3 … eklenir.
-- Var olan (dolu) slug'lar değişmez, Google'daki adresler korunur.

create or replace function public.cihaz_slug_metni(girdi text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(girdi, ''), 'ÇĞİIÖŞÜçğıöşüÂâÎîÛû', 'cgiiosucgiosuaaiiuu')),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

create or replace function public.second_hand_devices_web_slug_ayarla()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  taban text;
  aday text;
  ek int := 1;
  marka text := public.cihaz_slug_metni(new.brand);
  model text := public.cihaz_slug_metni(new.model);
  kapasite text := public.cihaz_slug_metni(new.capacity);
begin
  if coalesce(trim(new.web_slug), '') = '' then
    if not coalesce(new.web_published, false) then
      new.web_slug := null;
      return new;
    end if;

    taban := concat_ws('-',
      nullif(marka, ''),
      -- "MacBook MacBook" gibi tekrarları at
      nullif(case when marka <> '' and model like marka || '%' then substr(model, length(marka) + 2) else model end, ''),
      nullif(kapasite, ''),
      case when new.listing_type = 'new' then 'sifir' else 'ikinci-el' end
    );
    taban := left(coalesce(nullif(public.cihaz_slug_metni(taban), ''), 'cihaz'), 80);
  else
    taban := new.web_slug;
  end if;

  aday := taban;
  while exists (
    select 1 from public.second_hand_devices d
    where d.web_slug = aday and d.id is distinct from new.id
  ) loop
    ek := ek + 1;
    aday := taban || '-' || ek;
  end loop;

  new.web_slug := aday;
  return new;
end;
$$;

drop trigger if exists second_hand_devices_web_slug_ayarla on public.second_hand_devices;
create trigger second_hand_devices_web_slug_ayarla
  before insert or update of web_slug, web_published, brand, model, capacity, listing_type
  on public.second_hand_devices
  for each row
  execute function public.second_hand_devices_web_slug_ayarla();

-- Yayında olup slug'ı boş kalan ilanları doldur (tetikleyici üretir).
update public.second_hand_devices
set web_slug = null
where web_published = true and coalesce(trim(web_slug), '') = '';
