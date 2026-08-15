-- EsnafPRO tamir fiyat seed (Apple / iPhone)
-- Kaynak: EsnafPRO referans fiyat verisi
-- Üretim: 2026-08-15T23:03:15.719Z
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
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 6999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stoklarla sınırlıdır', 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 401),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 19999, null, 501),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 16999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7499, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 17 Air Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 9999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 3999, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17-air';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17 Pro Max', 'iphone-17-pro-max', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 9999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 21999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 17999, 'Stok sorunuz', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 501),
    ('Pil Değişimleri', 'Orijinal Servis Pili', 4899, 'Apple Desteksiz', 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 21999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça', 24999, null, 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 901),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Orijinal Servis Parçası', 9499, 'Apple Desteksiz', 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 8999, null, 1201),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası', 13999, 'Apple Destekli', 1301),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1401),
    ('Pil Değişimleri', 'Açılmayan iPhone 17 Pro Max Tamiri', 0, null, 1501),
    ('Pil Değişimleri', 'Face ID Tamiri', 7999, null, 1601),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1701),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 3999, null, 1801),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1901),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 9999, null, 2001),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 3999, null, 2101),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 2999, null, 2201),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2301),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2401),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2501),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2601),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2701),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2801),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2901)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17-pro-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17 Pro', 'iphone-17-pro', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 8999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 18999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 14999, 'Stok sorunuz', 201),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 21999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 501),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 23999, null, 601),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 8999, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 17 Pro Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 7999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 3999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 9999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 3999, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17-pro';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17', 'iphone-17', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 6999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 14999, 'Stoklarla sınırlıdır', 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 401),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Yeni)', 19999, null, 501),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 15999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7499, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 17 Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 9999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 3999, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 17e', 'iphone-17e', 5 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-17-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 8999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 11999, 'Stoklarla sınırlıdır', 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 401),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 19999, null, 501),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 12999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 6999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 17e Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 6999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1801),
    ('Pil Değişimleri', 'Arka Kamera Camı Değişimi', 1499, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-17-serisi' and m.slug = 'iphone-17e';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16 Plus', 'iphone-16-plus', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 8999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 14999, 'Stoklarla sınırlıdır', 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 401),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 19999, null, 501),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 8999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 7999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 9999, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 16 Plus Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 6999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16-plus';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 9999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 19999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 14999, 'Stok sorunuz', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 501),
    ('Pil Değişimleri', 'Orijinal Servis Pili', 4899, 'Apple Desteksiz', 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 11999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça', 24999, null, 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 901),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Orijinal Servis Parçası', 9499, 'Apple Desteksiz', 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1201),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 1301),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1401),
    ('Pil Değişimleri', 'Açılmayan iPhone 16 Pro Max Tamiri', 0, null, 1501),
    ('Pil Değişimleri', 'Face ID Tamiri', 7999, null, 1601),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1701),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 3999, null, 1801),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1901),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 2001),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2101),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2201),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2301),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2401),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2501),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2601),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2701),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2801),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2901)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16-pro-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16 Pro', 'iphone-16-pro', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 9999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 14999, 'Stok sorunuz', 201),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 10999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 501),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 23999, null, 601),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 16 Pro Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 7999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 3999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16-pro';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16', 'iphone-16', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 8999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 12999, 'Stoklarla sınırlıdır', 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 401),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 19999, null, 501),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 9999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 7499, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 16 Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 6999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 16e', 'iphone-16e', 5 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-16-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 8999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 14999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 11999, 'Stoklarla sınırlıdır', 201),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, null, 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 3499, null, 501),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 19999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 12999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 6999, 'Stoklarla sınırlıdır', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1101),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1201),
    ('Pil Değişimleri', 'Açılmayan iPhone 16e Tamiri', 0, null, 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 6999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-16-serisi' and m.slug = 'iphone-16e';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15 Plus', 'iphone-15-plus', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 7999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stoklarla sınırlıdır', 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, null, 501),
    ('Pil Değişimleri', 'Orijinal Parça', 14999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5499, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış)', 7499, 'Stoklarla sınırlıdır', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1101),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1201),
    ('Pil Değişimleri', 'Açılmayan iPhone 15 Plus Tamiri', 0, null, 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 6999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15-plus';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 9999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 19999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 9999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 15999, 'Stok sorunuz', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 16999, null, 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Stoklarla sınırlıdır', 901),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 13999, 'Apple Destekli', 1201),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1301),
    ('Pil Değişimleri', 'Açılmayan iPhone 15 Pro Max Tamiri', 0, null, 1401),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1501),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1601),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 3999, null, 1701),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1801),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 1901),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2001),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2101),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2201),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2301),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2401),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2501),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2601),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2701),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2801)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15-pro-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15 Pro', 'iphone-15-pro', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 8999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 9999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 15999, 'Stok sorunuz', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 15999, null, 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7499, 'Stoklarla sınırlıdır', 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 12499, 'Apple Destekli', 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1201),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1301),
    ('Pil Değişimleri', 'Açılmayan iPhone 15 Pro Tamiri', 0, null, 1401),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1501),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1601),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 3999, null, 1701),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 3999, null, 1801),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 1901),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2001),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2101),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2201),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2301),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2401),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2501),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2601),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2701),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2801)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15-pro';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 15', 'iphone-15', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-15-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 6999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 8999, 'Kısa süreli kampanya fiyatıdır, lütfen form açın, stok sorun, rezerve yapılmasını isteyin.', 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2999, null, 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3999, null, 501),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 14999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 6999, 'Stoklarla sınırlıdır', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1101),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1201),
    ('Pil Değişimleri', 'Açılmayan iPhone 15 Tamiri', 0, null, 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 6999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 6999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 5999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 2499, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-15-serisi' and m.slug = 'iphone-15';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14 Plus', 'iphone-14-plus', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 7999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 7999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 12999, null, 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3499, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 3499, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça', 11999, null, 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 10499, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7499, null, 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 1201),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1301),
    ('Pil Değişimleri', 'Açılmayan iPhone 14 Plus Tamiri', 0, null, 1401),
    ('Pil Değişimleri', 'Face ID Tamiri', 5999, null, 1501),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1601),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1801),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 1901),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2001),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2101),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2201),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 4999, null, 2301),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 4999, null, 2401),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2501),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2601),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2701),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2801)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14-plus';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14 Pro Max', 'iphone-14-pro-max', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 7999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 8999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 19999, 'Apple Destekli', 201),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15299, 'Apple Desteksiz', 301),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 15999, 'Stok sorunuz', 401),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2499, null, 501),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 601),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3499, null, 701),
    ('Pil Değişimleri', 'Orijinal Servis Pili', 4599, 'Apple Desteksiz', 801),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 12999, null, 901),
    ('Pil Değişimleri', 'Orijinal Parça (Defolu- Mor Renk)', 6999, null, 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 6999, null, 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 12499, 'Apple Destekli', 1201),
    ('Pil Değişimleri', 'Orijinal Servis Kamerası', 9999, 'Apple Desteksiz', 1301),
    ('Pil Değişimleri', 'Lidar Sensör Değişimi', 3499, null, 1401),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1501),
    ('Pil Değişimleri', 'Açılmayan iPhone 14 Pro Max Tamiri', 0, null, 1601),
    ('Pil Değişimleri', 'Face ID Tamiri', 5999, null, 1701),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1801),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1901),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 2001),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 2101),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2201),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2301),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2401),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 4999, null, 2501),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 4999, null, 2601),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2701),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2801),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2901),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 3001)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14-pro-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14 Pro', 'iphone-14-pro', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 7999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 7999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stok sorunuz', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2499, null, 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3499, null, 601),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4599, 'Apple Desteksiz', 701),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 12999, null, 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 6999, null, 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 12499, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Orijinal Servis Kamerası', 9999, 'Apple Desteksiz', 1101),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1201),
    ('Pil Değişimleri', 'Açılmayan iPhone 14 Pro Tamiri', 0, null, 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 5999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 4999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 4999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14-pro';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 14', 'iphone-14', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-14-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 6999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 8999, null, 201),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, null, 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 6999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 3499, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 7999, 'Arka cam dahil değildir, stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 11999, null, 801),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Servis Parçası (Yeni)', 9499, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Cam - Orijinal Parça (Kullanılmış, temiz)', 7499, 'Stoklarla sınırlıdır', 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 1201),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1999, null, 1301),
    ('Pil Değişimleri', 'Açılmayan iPhone 14 Tamiri', 0, null, 1401),
    ('Pil Değişimleri', 'Face ID Tamiri', 5999, null, 1501),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1601),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 2999, null, 1801),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 7999, null, 1901),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2999, null, 2001),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2101),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2201),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 5999, null, 2301),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 4999, null, 2401),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2501),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2601),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2701),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2801)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-14-serisi' and m.slug = 'iphone-14';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13 Mini', 'iphone-13-mini', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 4999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 13999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 9999, null, 201),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, null, 401),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, 'Stoklarla sınırlıdır', 501),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 11999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış)', 8999, 'Stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 5999, null, 901),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1001),
    ('Pil Değişimleri', 'Açılmayan iPhone 13 Mini Tamiri', 0, null, 1101),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 5999, '512GB', 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 4999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2499, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13-mini';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13 Pro Max', 'iphone-13-pro-max', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 5999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 7999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, null, 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, null, 501),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, 'Stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 10999, null, 701),
    ('Pil Değişimleri', 'Orijinal Parça', 13999, null, 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 6499, null, 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 11499, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 13 Pro Max Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 5999, null, 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 5999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2499, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13-pro-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13 Pro', 'iphone-13-pro', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 5999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 11999, null, 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, null, 501),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 2299, 'Stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Orijinal Parça', 12999, null, 701),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış)', 10999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 11499, 'Apple Destekli', 901),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 6499, null, 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 13 Pro Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 5999, '512GB', 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 5999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2499, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13-pro';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 13', 'iphone-13', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-13-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 5999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 5999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 9999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, null, 501),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, 'Stoklarla sınırlıdır', 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 6999, null, 701),
    ('Pil Değişimleri', 'Orijinal Parça Pembe (Kullanılmış, temiz)', 4999, null, 801),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 9999, null, 901),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Defolu)', 4999, null, 1001),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 3999, null, 1101),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Servis Kamerası (Yeni)', 8999, 'Apple Destekli', 1201),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1301),
    ('Pil Değişimleri', 'Açılmayan iPhone 13 Tamiri', 0, null, 1401),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 5999, '512GB', 1501),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1601),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 13999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1701),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1801),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 4999, null, 2001),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 2499, null, 2101),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2201),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2301),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2401),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2501),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2601),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2701),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2801),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2901)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-13-serisi' and m.slug = 'iphone-13';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12 Mini', 'iphone-12-mini', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 4999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 9999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 13999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, null, 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2499, null, 501),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 601),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 9999, null, 701),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış)', 6999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4499, null, 901),
    ('Pil Değişimleri', 'Orijinal Servis Kamerası (Yeni)', 0, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 12 Mini Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 5999, '256GB', 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 10999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 4999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1499, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1499, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12-mini';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12 Pro Max', 'iphone-12-pro-max', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 4999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 6999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 17999, 'Apple Destekli', 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 13999, 'Stoklarla sınırlıdır', 301),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, null, 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 7999, null, 701),
    ('Pil Değişimleri', 'Orijinal Parça', 11999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 901),
    ('Pil Değişimleri', 'Orijinal Servis Kamerası (Yeni)', 0, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 12 Pro Max Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 4999, null, 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 10999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 4999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12-pro-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12 Pro', 'iphone-12-pro', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 4999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 5999, 'Stok sorunuz', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 7999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, null, 501),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça', 7999, 'Stokta yok', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4999, null, 901),
    ('Pil Değişimleri', 'Orijinal Servis Kamerası', 0, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 12 Pro Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 4999, '256GB', 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 10999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 4999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1999, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12-pro';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 12', 'iphone-12', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-12-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 4999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 5999, 'Stok sorunuz', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 7999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 15999, 'Apple Destekli', 301),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, null, 401),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2999, null, 501),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, null, 601),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 5999, 'Stoklarla sınırlıdır', 701),
    ('Pil Değişimleri', 'Orijinal Parça (Yeni)', 6999, 'Stokta yok', 801),
    ('Pil Değişimleri', 'Arka Kamera - Orijinal Çıkma Kamera', 4499, null, 901),
    ('Pil Değişimleri', 'Orijinal Servis Kamerası (Yeni)', 0, 'Apple Destekli', 1001),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 1499, null, 1101),
    ('Pil Değişimleri', 'Açılmayan iPhone 12 Tamiri', 0, null, 1201),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 4999, '256GB', 1301),
    ('Pil Değişimleri', 'Face ID Tamiri', 4999, null, 1401),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 10999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1501),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1999, null, 1601),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1999, null, 1701),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 4999, null, 1801),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1999, null, 1901),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1499, null, 2101),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 3999, null, 2201),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 3999, null, 2301),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1499, null, 2401),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2501),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2601),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2701)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-12-serisi' and m.slug = 'iphone-12';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 11 Pro Max', 'iphone-11-pro-max', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-11-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 4999, null, 1),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 3999, null, 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15999, null, 201),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 16999, 'Apple Desteksiz', 301),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 8999, 'Stoklarla sınırlıdır', 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, null, 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2499, null, 601),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1499, null, 701),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış)', 4999, null, 801),
    ('Pil Değişimleri', 'Arka Kamera Değişimi', 3499, null, 901),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 999, null, 1001),
    ('Pil Değişimleri', 'Açılmayan iPhone 11 Pro Max Tamiri', 0, null, 1101),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 4499, null, 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 3999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 10999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1499, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 999, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-11-serisi' and m.slug = 'iphone-11-pro-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 11 Pro', 'iphone-11-pro', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-11-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 4999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 12999, 'Apple Destekli', 101),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı', 15999, 'Apple Desteksiz', 201),
    ('Ekran Değişimleri', 'Yüksek Kaliteli Ekran (Yeni)', 3799, null, 301),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, temiz)', 7999, null, 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 4999, null, 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2499, null, 601),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 1999, 'Stokta yok', 701),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, 'Stoklarla sınırlıdır', 801),
    ('Pil Değişimleri', 'Arka Kamera Değişimi', 3499, null, 901),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 999, null, 1001),
    ('Pil Değişimleri', 'Açılmayan iPhone 11 Pro Tamiri', 0, null, 1101),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 4499, '256GB', 1201),
    ('Pil Değişimleri', 'Face ID Tamiri', 3999, null, 1301),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 8999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1401),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1499, null, 1501),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1601),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 2999, null, 1701),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 1801),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 999, null, 1901),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 2101),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 2201),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1499, null, 2301),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2401),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2501),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2601)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-11-serisi' and m.slug = 'iphone-11-pro';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 11', 'iphone-11', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-11-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Ön Cam Değişimi', 2999, null, 1),
    ('Ekran Değişimleri', 'Orijinal Ekran (Yenilenmiş)', 4499, 'İndirimli', 101),
    ('Ekran Değişimleri', 'Orijinal Ekran (Defolu)', 3499, null, 201),
    ('Ekran Değişimleri', 'Orijinal Ekran (Kullanılmış, ikinci el)', 4499, null, 301),
    ('Ekran Değişimleri', 'Orijinal Servis Ekranı (Yeni)', 10999, 'Apple Destekli', 401),
    ('Pil Değişimleri', 'Orijinal Servis Pili (Yeni)', 5999, null, 501),
    ('Pil Değişimleri', 'Yüksek Kaliteli Pil (Yeni)', 2499, null, 601),
    ('Pil Değişimleri', 'Orijinal Pil (Kullanılmış)', 999, null, 701),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Kullanılmış, temiz)', 4999, null, 801),
    ('Pil Değişimleri', 'Kasa - Orijinal Parça (Defolu)', 1999, null, 901),
    ('Pil Değişimleri', 'Orijinal Parça', 7499, null, 1001),
    ('Pil Değişimleri', 'Arka Kamera Değişimi', 3499, null, 1101),
    ('Pil Değişimleri', 'Genel Bakım Temizlik', 999, null, 1201),
    ('Pil Değişimleri', 'Açılmayan iPhone 11 Tamiri', 0, null, 1301),
    ('Pil Değişimleri', 'Hafıza Yükseltme', 4499, '256GB', 1401),
    ('Pil Değişimleri', 'Face ID Tamiri', 2999, null, 1501),
    ('Pil Değişimleri', 'TrueDepth Kamera Değişimi', 10999, 'Face ID + Ön Kamera (Face ID %100 çözüm)', 1601),
    ('Pil Değişimleri', 'Ön Kamera Değişimi', 1499, null, 1701),
    ('Pil Değişimleri', 'Proximity Işık Sensör Fleksi Değişimi', 1499, null, 1801),
    ('Pil Değişimleri', 'Şarj Soketi Değişimi', 2999, null, 1901),
    ('Pil Değişimleri', 'İç Kulaklık Hoparlörü (Ahize) Değişimi', 1499, null, 2001),
    ('Pil Değişimleri', 'Kamera Camı Değişimi', 999, null, 2101),
    ('Pil Değişimleri', 'Hoparlör Değişimi', 1499, null, 2201),
    ('Pil Değişimleri', 'Aç Kapat Butonu ve Flaş Değişimi', 1999, null, 2301),
    ('Pil Değişimleri', 'Ses Butonları ve Sessize Alma Tuşu Değişimi', 1999, null, 2401),
    ('Pil Değişimleri', 'Titreşim Motoru Değişimi', 1499, null, 2501),
    ('Pil Değişimleri', 'Sıvı Teması Tamiri', 0, null, 2601),
    ('Pil Değişimleri', 'Veri Kurtarma', 0, null, 2701),
    ('Pil Değişimleri', 'Diğer tamirler', 0, null, 2801)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-11-serisi' and m.slug = 'iphone-11';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone X', 'iphone-x', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Yüksek Kaliteli Ekran (Yeni)', 2999, null, 1),
    ('Genel', 'Orijinal Ekran', 6499, 'Stokta yok', 101)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-x-serisi' and m.slug = 'iphone-x';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone XR', 'iphone-xr', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone XS Max', 'iphone-xs-max', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Yüksek Kaliteli Ekran (Yeni)', 3999, null, 1),
    ('Genel', 'Orijinal Ekran', 9999, 'Stokta yok', 101)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-x-serisi' and m.slug = 'iphone-xs-max';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone XS', 'iphone-xs', 4 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-x-serisi';
insert into public.tamir_fiyatlari (model_id, category, service_name, price, description, sort_order)
select m.id, v.category, v.service_name, v.price, v.description, v.sort_order
from public.tamir_modelleri m
join public.tamir_serileri s on s.id = m.seri_id
join public.tamir_markalari br on br.id = s.marka_id
cross join (values
    ('Genel', 'Yüksek Kaliteli Ekran (Yeni)', 2999, null, 1),
    ('Genel', 'Orijinal Ekran (Kullanılmış, temiz)', 5999, null, 101)
) as v(category, service_name, price, description, sort_order)
where br.slug = 'apple' and s.slug = 'iphone-x-serisi' and m.slug = 'iphone-xs';

insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 8 Plus', 'iphone-8-plus', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-8-serisi';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone 8', 'iphone-8', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-8-serisi';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone SE 2016', 'iphone-se-2016', 1 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-se-serisi';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone SE 2020 (2. nesil)', 'iphone-se-2020', 2 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-se-serisi';
insert into public.tamir_modelleri (seri_id, name, slug, sort_order) select s.id, 'iPhone SE 2022 (3. nesil)', 'iphone-se-2022', 3 from public.tamir_serileri s join public.tamir_markalari m on m.id = s.marka_id where m.slug = 'apple' and s.slug = 'iphone-se-serisi';
commit;
