-- Dükkanın bilinen semt/bölge adı (Esenkent, Bahçeşehir…).
-- Ürün, blog ve cihaz sayfalarının Google başlığında ilçeyle birlikte kullanılır:
-- "Hayalet Cam — Esenkent, Esenyurt". Boşsa semt adresten bulunmaya çalışılır.
alter table public.dukkanlar add column if not exists semt text;

alter table public.dukkanlar drop constraint if exists dukkanlar_semt_uzunluk;
alter table public.dukkanlar
  add constraint dukkanlar_semt_uzunluk check (semt is null or char_length(semt) <= 40);

-- Dükkan sahibinin isteği: Beep Mobile Store Esenkent'te.
update public.dukkanlar set semt = 'Esenkent'
where slug = 'beepmobilestore' and semt is null;
