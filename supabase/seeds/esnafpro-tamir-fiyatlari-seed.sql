-- EsnafPRO tamir fiyat seed (Apple / iPhone)
-- Kaynak: EsnafPRO referans fiyat verisi (fpprotr.com, Ağustos 2026)
-- Üretim: 2026-08-17T21:15:28.822Z
-- Doğru kategori yapısı: Genel | Ekran Değişimleri | Pil Değişimleri
--   | Kasa Değişimleri | Arka Cam Değişimleri | Arka Kamera Değişimleri | Diğer Onarımlar
begin;

delete from public.tamir_fiyatlari;
delete from public.tamir_modelleri;
delete from public.tamir_serileri;
delete from public.tamir_markalari where slug = 'apple';

insert into public.tamir_markalari (name, slug, sort_order, aktif) values ('Apple', 'apple', 1, true);

insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 17 Serisi', 'iphone-17-serisi', 1 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 16 Serisi', 'iphone-16-serisi', 2 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 15 Serisi', 'iphone-15-serisi', 3 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 14 Serisi', 'iphone-14-serisi', 4 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 13 Serisi', 'iphone-13-serisi', 5 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 12 Serisi', 'iphone-12-serisi', 6 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 11 Serisi', 'iphone-11-serisi', 7 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone X Serisi', 'iphone-x-serisi', 8 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone 8 Serisi', 'iphone-8-serisi', 9 from public.tamir_markalari m where m.slug = 'apple';
insert into public.tamir_serileri (marka_id, name, slug, sort_order) select m.id, 'iPhone SE Serisi', 'iphone-se-serisi', 10 from public.tamir_markalari m where m.slug = 'apple';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17 Air', 'iphone-17-air', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 6999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 500),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 19999, 'Arka cam dahildir', 600),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 16999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 700),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7499, 'Stoklarla sınırlıdır', 900),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1100),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1200),
  ('Diğer Onarımlar', 'Açılmayan iPhone 17 Air Tamiri', 0, 'Tespit gerekli', 1300),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1400),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1500),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1600),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 9999, null, 1800),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 3999, null, 1900),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1999, null, 2000),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2100),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2200),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2400),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2500),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2700)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17-air';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17 Pro Max', 'iphone-17-pro-max', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 9999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 21999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 18999, 'Stok sorunuz', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Orijinal Servis Pili', 4899, 'Apple Desteksiz', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 21999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Kasa Değişimleri', 'Orijinal Parça', 24999, 'Arka cam dahildir', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 1000),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1100),
  ('Arka Cam Değişimleri', 'Orijinal Servis Parçası', 9499, 'Apple Desteksiz', 1200),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 8999, null, 1300),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası', 13999, 'Apple Destekli', 1400),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1500),
  ('Diğer Onarımlar', 'Açılmayan iPhone 17 Pro Max Tamiri', 0, 'Tespit gerekli', 1600),
  ('Diğer Onarımlar', 'Face ID Tamiri', 7999, null, 1700),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1800),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 3999, null, 1900),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 9999, null, 2100),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 3999, null, 2200),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 2999, null, 2300),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2400),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2500),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2600),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2700),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2800),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2900),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 3000)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17-pro-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17 Pro', 'iphone-17-pro', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 8999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 18999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 14999, 'Stok sorunuz', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 600),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 19999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 23999, 'Arka cam dahildir', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 1100),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 8999, null, 1200),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1300),
  ('Diğer Onarımlar', 'Açılmayan iPhone 17 Pro Tamiri', 0, 'Tespit gerekli', 1400),
  ('Diğer Onarımlar', 'Face ID Tamiri', 7999, null, 1500),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1600),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 3999, null, 1700),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1800),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 9999, null, 1900),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1999, null, 2100),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2400),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2500),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2700),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2800)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17-pro';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17', 'iphone-17', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 7999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 12999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 500),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 19999, 'Arka cam dahildir', 600),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 11999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 700),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 7499, 'Stoklarla sınırlıdır', 900),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1100),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1200),
  ('Diğer Onarımlar', 'Açılmayan iPhone 17 Tamiri', 0, 'Tespit gerekli', 1300),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1400),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1500),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1600),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 6999, null, 1800),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2100),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2200),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2400),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2500),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2700)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17e', 'iphone-17e', 5 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 7999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 14999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 11999, 'Stoklarla sınırlıdır', 300),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 600),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 19999, 'Arka cam dahildir', 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 12999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 900),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1100),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1200),
  ('Diğer Onarımlar', 'Açılmayan iPhone 17e Tamiri', 0, 'Tespit gerekli', 1300),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1400),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1500),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1600),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 6999, null, 1800),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2100),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2200),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2400),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2500),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2700)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17e';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 9999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 19999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 14999, 'Stok sorunuz', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Orijinal Servis Pili', 4899, 'Apple Desteksiz', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 11999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Kasa Değişimleri', 'Orijinal Parça', 24999, 'Arka cam dahildir', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 1000),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1100),
  ('Arka Cam Değişimleri', 'Orijinal Servis Parçası', 9499, 'Apple Desteksiz', 1200),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1300),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 1400),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1500),
  ('Diğer Onarımlar', 'Açılmayan iPhone 16 Pro Max Tamiri', 0, 'Tespit gerekli', 1600),
  ('Diğer Onarımlar', 'Face ID Tamiri', 7999, null, 1700),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1800),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 3999, null, 1900),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 7999, null, 2100),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2200),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2300),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2400),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2500),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2600),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2700),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2800),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2900),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 3000)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16-pro-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16 Pro', 'iphone-16-pro', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 8999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stok sorunuz', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 600),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 10999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 23999, 'Arka cam dahildir', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 1100),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1200),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1300),
  ('Diğer Onarımlar', 'Açılmayan iPhone 16 Pro Tamiri', 0, 'Tespit gerekli', 1400),
  ('Diğer Onarımlar', 'Face ID Tamiri', 7999, null, 1500),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1600),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 3999, null, 1700),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1800),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 7999, null, 1900),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2000),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2100),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2400),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2500),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2700),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2800)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16-pro';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16 Plus', 'iphone-16-plus', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 8999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 12999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 500),
  ('Kasa Değişimleri', 'Orijinal Parça (Yeni)', 19999, 'Arka cam dahildir', 600),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 9999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 700),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 7499, 'Stoklarla sınırlıdır', 900),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1100),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1200),
  ('Diğer Onarımlar', 'Açılmayan iPhone 16 Plus Tamiri', 0, 'Tespit gerekli', 1300),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1400),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1500),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1600),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 6999, null, 1800),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2100),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2200),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2400),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2500),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2700)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16-plus';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16', 'iphone-16', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 8999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 12999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 500),
  ('Kasa Değişimleri', 'Orijinal Parça (Yeni)', 19999, 'Arka cam dahildir', 600),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 9999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 700),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 7499, 'Stoklarla sınırlıdır', 900),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1100),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1200),
  ('Diğer Onarımlar', 'Açılmayan iPhone 16 Tamiri', 0, 'Tespit gerekli', 1300),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1400),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1500),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1600),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 6999, null, 1800),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2100),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2200),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2400),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2500),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2700)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16e', 'iphone-16e', 5 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 8999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 14999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 11999, 'Stoklarla sınırlıdır', 300),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 600),
  ('Kasa Değişimleri', 'Orijinal Parça (Yeni)', 19999, 'Arka cam dahildir', 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 12999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 900),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 1100),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1200),
  ('Diğer Onarımlar', 'Açılmayan iPhone 16e Tamiri', 0, 'Tespit gerekli', 1300),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1400),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1500),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1600),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 6999, null, 1800),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2100),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2200),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2400),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2500),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2700)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16e';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 9999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 19999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 9999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 15999, 'Stok sorunuz', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, 'Marka: Deji, pil sağlığı aktif çalışır', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 700),
  ('Kasa Değişimleri', 'Orijinal Parça (Yeni)', 16999, 'Arka cam dahildir', 800),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1000),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Stoklarla sınırlıdır', 1100),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 1200),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 7999, null, 1300),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1400),
  ('Diğer Onarımlar', 'Açılmayan iPhone 15 Pro Max Tamiri', 0, 'Tespit gerekli', 1500),
  ('Diğer Onarımlar', 'Face ID Tamiri', 7999, null, 1600),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1700),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 3999, null, 1800),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1900),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 7999, null, 2000),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2100),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2200),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2300),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2400),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2500),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2600),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2700),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2800),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2900)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15-pro-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15 Pro', 'iphone-15-pro', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 7999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 7999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stok sorunuz', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, 'Marka: Deji, pil sağlığı aktif çalışır', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 700),
  ('Kasa Değişimleri', 'Orijinal Parça (Yeni)', 14999, 'Arka cam dahildir', 800),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1000),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Stoklarla sınırlıdır', 1100),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 10999, 'Apple Destekli', 1200),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1300),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1400),
  ('Diğer Onarımlar', 'Açılmayan iPhone 15 Pro Tamiri', 0, 'Tespit gerekli', 1500),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1600),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1700),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 3999, null, 1800),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1900),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 7999, null, 2000),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2100),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2200),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2300),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2400),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2500),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2600),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2700),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2800),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2900)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15-pro';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15 Plus', 'iphone-15-plus', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 6999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 8999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 400),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, 'Marka: Deji, pil sağlığı aktif çalışır', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 600),
  ('Kasa Değişimleri', 'Orijinal Parça (Yeni)', 14999, 'Arka cam dahildir', 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Stoklarla sınırlıdır', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1100),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 1200),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1300),
  ('Diğer Onarımlar', 'Açılmayan iPhone 15 Plus Tamiri', 0, 'Tespit gerekli', 1400),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1500),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1600),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1800),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 6999, null, 1900),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 2000),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2100),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2400),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2500),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2700),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2800)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15-plus';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15', 'iphone-15', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 6999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 8999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 400),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, 'Marka: Deji, pil sağlığı aktif çalışır', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 600),
  ('Kasa Değişimleri', 'Orijinal Parça (Yeni)', 14999, 'Arka cam dahildir', 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 900),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Stoklarla sınırlıdır', 1000),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1100),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 1200),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1300),
  ('Diğer Onarımlar', 'Açılmayan iPhone 15 Tamiri', 0, 'Tespit gerekli', 1400),
  ('Diğer Onarımlar', 'Face ID Tamiri', 6999, null, 1500),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1600),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1700),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1800),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 6999, null, 1900),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 2000),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2100),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2300),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2400),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2500),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2600),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2700),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2800)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14 Pro Max', 'iphone-14-pro-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 7999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 19999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 300),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 8999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 400),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 15999, 'Stok sorunuz', 500),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 600),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji, pil sağlığı aktif çalışır', 700),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2499, null, 800),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 900),
  ('Kasa Değişimleri', 'Orijinal Parça', 14999, 'Arka cam dahildir', 1000),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1100),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Stoklarla sınırlıdır', 1200),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 10999, 'Apple Destekli', 1300),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1400),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1500),
  ('Diğer Onarımlar', 'Açılmayan iPhone 14 Pro Max Tamiri', 0, 'Tespit gerekli', 1600),
  ('Diğer Onarımlar', 'Face ID Tamiri', 5999, null, 1700),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1800),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 2000),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 5999, null, 2100),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2300),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2400),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2500),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2600),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2700),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2800),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2900),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 3000)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14-pro-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14 Pro', 'iphone-14-pro', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 6999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 300),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 7999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 400),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 12999, 'Stok sorunuz', 500),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 600),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji, pil sağlığı aktif çalışır', 700),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2499, null, 800),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 6999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 900),
  ('Kasa Değişimleri', 'Orijinal Parça', 12999, 'Arka cam dahildir', 1000),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1100),
  ('Arka Cam Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 3999, 'Stoklarla sınırlıdır', 1200),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 9999, 'Apple Destekli', 1300),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1400),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1500),
  ('Diğer Onarımlar', 'Açılmayan iPhone 14 Pro Tamiri', 0, 'Tespit gerekli', 1600),
  ('Diğer Onarımlar', 'Face ID Tamiri', 5999, null, 1700),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1800),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 2000),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 5999, null, 2100),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 2300),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2400),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2500),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2600),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 2499, null, 2700),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2800),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2900),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 3000)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14-pro';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14 Plus', 'iphone-14-plus', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 4999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 11999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 5999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 8999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji, pil sağlığı aktif çalışır', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 900),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1000),
  ('Diğer Onarımlar', 'Açılmayan iPhone 14 Plus Tamiri', 0, 'Tespit gerekli', 1100),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1200),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1300),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1999, null, 1400),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1500),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 4999, null, 1600),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2100),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2300),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2400),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2500)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14-plus';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14', 'iphone-14', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 3999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 9999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 4999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 6999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji, pil sağlığı aktif çalışır', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 3999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 800),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 900),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1000),
  ('Diğer Onarımlar', 'Açılmayan iPhone 14 Tamiri', 0, 'Tespit gerekli', 1100),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1200),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1300),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1999, null, 1400),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1500),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 3999, null, 1600),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2100),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2300),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2400),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2500)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13 Pro Max', 'iphone-13-pro-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 5999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 7999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Arka cam dahildir, stoklarla sınırlıdır', 800),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 900),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1000),
  ('Diğer Onarımlar', 'Açılmayan iPhone 13 Pro Max Tamiri', 0, 'Tespit gerekli', 1100),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1200),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1300),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1999, null, 1400),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1500),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 3999, null, 1600),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2100),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2300),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2400),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2500)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13-pro-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13 Pro', 'iphone-13-pro', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 4999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 14999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 5999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 10999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Arka cam dahildir, stoklarla sınırlıdır', 800),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 900),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 1000),
  ('Diğer Onarımlar', 'Açılmayan iPhone 13 Pro Tamiri', 0, 'Tespit gerekli', 1100),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1200),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1300),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1999, null, 1400),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1500),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 3999, null, 1600),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2100),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2300),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2400),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2500)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13-pro';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13 Mini', 'iphone-13-mini', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 2999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 9999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 3999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 6999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1999, 'Marka: Deji', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1499, null, 700),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 2999, null, 800),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 900),
  ('Diğer Onarımlar', 'Açılmayan iPhone 13 Mini Tamiri', 0, 'Tespit gerekli', 1000),
  ('Diğer Onarımlar', 'Face ID Tamiri', 3999, null, 1100),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1200),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1400),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 2999, null, 1500),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1600),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1700),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 2999, null, 2000),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1499, null, 2100),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2200),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2300),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2400)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13-mini';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13', 'iphone-13', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 3999, null, 100),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 11999, 'Apple Destekli', 200),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 4999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, 'Apple Destekli', 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1999, 'Marka: Deji', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1499, null, 700),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3499, null, 800),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 900),
  ('Diğer Onarımlar', 'Açılmayan iPhone 13 Tamiri', 0, 'Tespit gerekli', 1000),
  ('Diğer Onarımlar', 'Face ID Tamiri', 3999, null, 1100),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1200),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1999, null, 1300),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1400),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 3499, null, 1500),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1600),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 1700),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 2999, null, 2000),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1499, null, 2100),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2200),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2300),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2400)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12 Pro Max', 'iphone-12-pro-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 4999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, null, 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji, 4410mAh', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Arka cam dahildir, stoklarla sınırlıdır', 800),
  ('Kasa Değişimleri', 'Orijinal Parça', 11999, 'Arka cam dahildir, stoklarla sınırlıdır', 900),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1000),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1499, null, 1100),
  ('Diğer Onarımlar', 'Açılmayan iPhone 12 Pro Max Tamiri', 0, 'Tespit gerekli', 1200),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1300),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1400),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1999, null, 1500),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 4999, null, 1700),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 1900),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 2000),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2100),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2200),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1999, null, 2300),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2400),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2500),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2600)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12-pro-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12 Pro', 'iphone-12-pro', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 3999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 5999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 200),
  ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 14999, 'Apple Destekli', 300),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 10999, 'Stoklarla sınırlıdır', 400),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, null, 500),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, 'Marka: Deji', 600),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1499, null, 700),
  ('Kasa Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Arka cam dahildir, stoklarla sınırlıdır', 800),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 900),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1499, null, 1000),
  ('Diğer Onarımlar', 'Açılmayan iPhone 12 Pro Tamiri', 0, 'Tespit gerekli', 1100),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1200),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1300),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1999, null, 1400),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1500),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 4999, null, 1600),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2000),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2100),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1999, null, 2200),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2300),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2400),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2500)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12-pro';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12 Mini', 'iphone-12-mini', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 2499, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 3999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 6999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, null, 400),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1999, 'Marka: Deji', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1499, null, 600),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 2999, null, 700),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1499, null, 800),
  ('Diğer Onarımlar', 'Açılmayan iPhone 12 Mini Tamiri', 0, 'Tespit gerekli', 900),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1000),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1100),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1499, null, 1200),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 3999, null, 1400),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1500),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1600),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 2999, null, 1800),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2200),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2300)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12-mini';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12', 'iphone-12', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 2999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 4999, '1 yıl parça garantili, ayarlarda bilinmeyen parça yazar', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 8999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, null, 400),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1999, 'Marka: Deji', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1499, null, 600),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 2999, null, 700),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1499, null, 800),
  ('Diğer Onarımlar', 'Açılmayan iPhone 12 Tamiri', 0, 'Tespit gerekli', 900),
  ('Diğer Onarımlar', 'Face ID Tamiri', 4999, null, 1000),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1100),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1499, null, 1200),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 3999, null, 1400),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1500),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1600),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 2999, null, 1800),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 2999, null, 1900),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2200),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2300)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 11 Pro Max', 'iphone-11-pro-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-11-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 2999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 3999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 3999, null, 400),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1499, 'Marka: Deji', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 999, null, 600),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 700),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1499, null, 800),
  ('Diğer Onarımlar', 'Açılmayan iPhone 11 Pro Max Tamiri', 0, 'Tespit gerekli', 900),
  ('Diğer Onarımlar', 'Face ID Tamiri', 3999, null, 1000),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 9999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1100),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1499, null, 1200),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 2999, null, 1400),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1500),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1600),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2200),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2300)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-11-serisi' and m.slug = 'iphone-11-pro-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 11 Pro', 'iphone-11-pro', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-11-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 2499, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 2999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 5999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 3999, null, 400),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1499, 'Marka: Deji', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 999, null, 600),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 2999, null, 700),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1499, null, 800),
  ('Diğer Onarımlar', 'Açılmayan iPhone 11 Pro Tamiri', 0, 'Tespit gerekli', 900),
  ('Diğer Onarımlar', 'Face ID Tamiri', 3999, null, 1000),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 9999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1100),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1499, null, 1200),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 2999, null, 1400),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1500),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1600),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2200),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2300)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-11-serisi' and m.slug = 'iphone-11-pro';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 11', 'iphone-11', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-11-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 1999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 2499, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 4499, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 3499, null, 400),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1499, 'Marka: Deji', 500),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 799, null, 600),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 2499, null, 700),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1499, null, 800),
  ('Diğer Onarımlar', 'Açılmayan iPhone 11 Tamiri', 0, 'Tespit gerekli', 900),
  ('Diğer Onarımlar', 'Face ID Tamiri', 2999, null, 1000),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 7999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1100),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 1499, null, 1200),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 2499, null, 1400),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1500),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1600),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 1900),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 1499, null, 2000),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2200),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2300)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-11-serisi' and m.slug = 'iphone-11';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone XS Max', 'iphone-xs-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 1999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 2999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 5999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1499, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 799, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 2999, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone XS Max Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 2999, null, 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 7999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 999, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 999, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1999, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 999, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 999, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-x-serisi' and m.slug = 'iphone-xs-max';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone XS', 'iphone-xs', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 1999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 2499, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 4999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1499, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 799, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 2499, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone XS Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 2999, null, 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 7999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 999, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 999, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1999, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 999, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 999, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 999, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-x-serisi' and m.slug = 'iphone-xs';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone XR', 'iphone-xr', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 1499, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 1999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 3499, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1299, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 699, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 1999, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone XR Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 2499, null, 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 5999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 999, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 999, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1999, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 999, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 799, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1499, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 999, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-x-serisi' and m.slug = 'iphone-xr';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone X', 'iphone-x', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 1499, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 1999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 3999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1299, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 699, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 1999, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone X Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 2499, null, 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 5999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 999, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 999, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1999, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 999, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 799, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1499, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 999, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-x-serisi' and m.slug = 'iphone-x';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 8 Plus', 'iphone-8-plus', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-8-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 1499, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 2999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 999, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 499, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 1499, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone 8 Plus Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 0, 'Bu modelde Face ID bulunmamaktadır', 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 0, 'Bu modelde Face ID bulunmamaktadır', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 799, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 799, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 799, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 499, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 999, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 999, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 799, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-8-serisi' and m.slug = 'iphone-8-plus';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 8', 'iphone-8', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-8-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 799, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 1199, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 2499, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 999, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 499, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 1299, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone 8 Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 0, 'Bu modelde Face ID bulunmamaktadır', 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 0, 'Bu modelde Face ID bulunmamaktadır', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 699, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 699, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1299, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 699, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 499, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 999, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 999, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 699, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-8-serisi' and m.slug = 'iphone-8';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone SE 2022 (3. nesil)', 'iphone-se-2022', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-se-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 1999, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 2999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 4499, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 1499, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 699, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 1999, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone SE 2022 Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 0, 'Bu modelde Face ID bulunmamaktadır', 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 0, 'Bu modelde Face ID bulunmamaktadır', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 999, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 999, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1499, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 999, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 699, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 1499, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1499, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 999, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-se-serisi' and m.slug = 'iphone-se-2022';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone SE 2020 (2. nesil)', 'iphone-se-2020', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-se-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 1499, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 1999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 2999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 999, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 499, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 1499, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone SE 2020 Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 0, 'Bu modelde Face ID bulunmamaktadır', 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 0, 'Bu modelde Face ID bulunmamaktadır', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 799, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 799, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 1299, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 799, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 499, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 999, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 999, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 699, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-se-serisi' and m.slug = 'iphone-se-2020';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone SE 2016', 'iphone-se-2016', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-se-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price::integer, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
  ('Genel', 'Ön Cam Değişimi', 799, null, 100),
  ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 999, '1 yıl parça garantili', 200),
  ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 1999, 'Stoklarla sınırlıdır', 300),
  ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 799, 'Marka: Deji', 400),
  ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 399, null, 500),
  ('Arka Kamera Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 999, null, 600),
  ('Diğer Onarımlar', 'Genel Bakım Temizlik', 1999, null, 700),
  ('Diğer Onarımlar', 'Açılmayan iPhone SE 2016 Tamiri', 0, 'Tespit gerekli', 800),
  ('Diğer Onarımlar', 'Face ID Tamiri', 0, 'Bu modelde Face ID bulunmamaktadır', 900),
  ('Diğer Onarımlar', 'TrueDepth Kamera Değişimi', 0, 'Bu modelde Face ID bulunmamaktadır', 1000),
  ('Diğer Onarımlar', 'Ön Kamera Değişimi', 499, null, 1100),
  ('Diğer Onarımlar', 'Proximity Işık Sensör Fleksi Değişimi', 499, null, 1200),
  ('Diğer Onarımlar', 'Şarj Soketi Değişimi', 999, null, 1300),
  ('Diğer Onarımlar', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 499, null, 1400),
  ('Diğer Onarımlar', 'Kamera Camı Değişimi', 299, null, 1500),
  ('Diğer Onarımlar', 'Hoparlör Değişimi', 1999, null, 1600),
  ('Diğer Onarımlar', 'Aç Kapat Butonu ve Flaş Değişimi', 699, null, 1700),
  ('Diğer Onarımlar', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 699, null, 1800),
  ('Diğer Onarımlar', 'Titreşim Motoru Değişimi', 499, null, 1900),
  ('Diğer Onarımlar', 'Sıvı Teması Tamiri', 0, 'Tespit gerekli', 2000),
  ('Diğer Onarımlar', 'Veri Kurtarma', 0, 'Tespit gerekli', 2100),
  ('Diğer Onarımlar', 'Diğer tamirler', 0, 'Tespit gerekli', 2200)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-se-serisi' and m.slug = 'iphone-se-2016';
commit;
