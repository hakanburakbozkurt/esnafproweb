# UI Yenileme — Test Kontrol Listesi

Dal: `ui-yenileme` · Kapsam: Aşama 0–5 (vitrin ve panel yenilemesi)

Her maddeyi **mobilde (≤ 767 px)** ve **masaüstünde** ayrı ayrı deneyin. `[oto]` işaretli maddeler otomatik testlerle de doğrulanır; yine de sürüm öncesinde bir kez elle bakılması önerilir.

## Otomatik testleri çalıştırma

| Komut | Ne yapar |
|---|---|
| `npm test` | Vitest birim testleri (`src/**/*.test.ts(x)`) |
| `npm run test:watch` | Birim testlerini izleme kipinde çalıştırır |
| `npm run test:e2e` | Playwright uçtan uca testleri (`e2e/`); masaüstü Chrome ve Pixel 7 profilleri |

Uçtan uca testler için ortam değişkenleri:

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `E2E_BASE_URL` | — | Verilirse geliştirme sunucusu başlatılmaz, bu adres test edilir (ör. önizleme ortamı). |
| `E2E_VITRIN_SLUG` | `beepmobilestore` | Ürünleri olan, yayındaki bir mağazanın kısa adı. |
| `E2E_EMAIL`, `E2E_PASSWORD` | — | Esnaf test hesabı. Verilmezse panel testleri atlanır. |

Panel testleri hiçbir zaman **Kaydet**'e basmaz; yaptığı değişikliği **İptal** ile geri alır. Yine de gerçek mağaza yerine test hesabı kullanın.

İlk kurulumda tarayıcıyı indirin: `npx playwright install chromium`.

---

## Aşama 0 — Veri katmanı (kategori, fiyat, stok, 8 fotoğraf)

- [ ] Migration uygulanmış: `dukkan_urunleri` tablosunda `urun_kategorisi`, `fiyat`, `stok_adedi`, `fotograf_url_4 … fotograf_url_8` sütunları var.
- [ ] Eski ürünler (yeni sütunları boş) vitrinde ve panelde hatasız görünüyor.
- [ ] [oto] Gizli alanlarla gönderilen ürün, sunucuda tüm alanlarıyla (8 fotoğraf, kategori, fiyat, stok, görsel oranı) kayıpsız geri okunuyor.
- [ ] [oto] Fotoğrafı olmayan ürün kaydedilmiyor; yalnızca ek fotoğrafı olan ürün kaydediliyor.
- [ ] [oto] Stok: boş veya geçersiz değer → NULL, `0` korunuyor.

## Aşama 1 — Dükkan Ayarları (bölümlü form, yapışkan kaydet çubuğu)

- [ ] Masaüstünde sol menü, mobilde yatay çipler görünüyor; kaydırdıkça etkin bölüm vurgulanıyor.
- [ ] Menüden bir bölüme tıklayınca başlık yapışkan üst çubukların altında kalmıyor.
- [ ] Hiçbir alan değişmeden "Tüm değişiklikler kayıtlı" yazıyor; bir alan değişince "Kaydedilmemiş değişiklik var" ve kırmızı nokta çıkıyor.
- [ ] Kaydedilmemiş değişiklik varken sekmeyi kapatmaya çalışınca tarayıcı uyarı veriyor.
- [ ] **İptal** onay istiyor; onaylanınca form ilk hâline dönüyor.
- [ ] Kaydet sonrası "Kaydedildi" görünüyor ve form temiz duruma geçiyor.
- [ ] Ayarlarda kaydet yapınca **ürünler silinmiyor** (Ürünler özet kartındaki sayı aynı kalıyor). ⚠️ En kritik madde.
- [ ] "Ürünleri yönet" bağlantısı, kaydedilmemiş değişiklik varsa onay istiyor.
- [ ] `/dukkan-ac` sayfasında İptal düğmesi yok; boş durumda "Bilgileri doldurup mağazanızı açın" yazıyor; kaydet çubuğu mobilde de her zaman görünüyor.
- [ ] Mağaza adı yazılınca kısa ad (slug) otomatik doluyor; kısa ad elle değiştirilince artık otomatik güncellenmiyor.

## Aşama 2 — Ürün yönetimi sayfası (`/dukkan-ayarlari/urunler`)

- [ ] Sayfa yüklenirken iskelet (skeleton) görünüyor.
- [ ] Arama ve kategori filtresi (Tümü / kategori / Kategorisiz) doğru çalışıyor.
- [ ] Karta dokununca düzenleme paneli açılıyor: mobilde alttan, masaüstünde sağdan.
- [ ] Kategori seçimi: mevcut kategoriler listeleniyor; "+ Yeni kategori…" metin alanı açıyor.
- [ ] Fiyat ve stok kaydediliyor; vitrinde stok rozeti doğru: `0` Tükendi, `1` Son 1 adet, `>1` Stokta, boş → rozet yok. [oto: rozet mantığı]
- [ ] 8 üründe "+ Ürün Ekle" pasif ve "En fazla 8 ürün ekleyebilirsiniz" yazıyor.
- [ ] Fotoğrafsız ürün varken kaydet, uyarı ve onay istiyor.
- [ ] Fotoğraf yüklenirken kaydet düğmesi pasif.
- [ ] Kaydet sonrası vitrin güncelleniyor (sayfayı yenileyince yeni veriler görünüyor).
- [ ] Toptancı hesabı bu sayfaya girince toptancı sayfasına yönlendiriliyor.

## Aşama 3 — Ürün fotoğrafları (8 yuva, sıralama, sıkıştırma)

- [ ] Birden fazla fotoğraf aynı anda seçilebiliyor; masaüstünde sürükle-bırak alanı çalışıyor.
- [ ] Yükleme sırasında her fotoğraf için ilerleme görünüyor; büyük fotoğraflar sıkıştırılıyor (≈ 1600 px, ≈ 1 MB).
- [ ] Tutamaçla sürükleyerek ve yukarı/aşağı oklarla sıralama yapılabiliyor. [oto: sıralama sonrası kapak]
- [ ] "Kapak yap" fotoğrafı ilk sıraya alıyor; vitrin kartında kapak bu fotoğraf.
- [ ] Silinen fotoğraftan sonra yuvalarda boşluk kalmıyor. [oto]
- [ ] Yükleme sürerken ürün adını değiştirmek, yükleme bitince kaybolmuyor.
- [ ] Hareketi azalt (reduced motion) açıkken sürükleme animasyonları kapalı.

## Aşama 4 — Vitrin (`/[slug]`)

- [ ] Ürünler kategorilere göre gruplanıyor; kategorisizler en sonda "Diğer ürünler" başlığında. Hiç kategori yoksa başlık gösterilmiyor. [oto: gruplama]
- [ ] Birden çok kategori varsa kategori çipleri görünüyor ve ilgili bölüme kaydırıyor.
- [ ] Kartlarda başlık en fazla 2 satır; masaüstünde üzerine gelince ikinci fotoğraf görünüyor; tükenen ürün gri ve fiyatı çizili.
- [ ] [oto] Karta dokununca detay açılıyor, adres `?urun=` alıyor, sayfa kaydırması kilitleniyor.
- [ ] [oto] Escape ve tarayıcının geri tuşu detayı kapatıyor; odak tıklanan karta dönüyor.
- [ ] [oto] Paylaşılan `?urun=` bağlantısı doğrudan detayı açıyor; bilinmeyen kimlikte detay açılmıyor.
- [ ] [oto] Fotoğrafa dokununca tam ekran açılıyor; Escape önce tam ekranı, sonra detayı kapatıyor.
- [ ] [oto] "WhatsApp'tan sor" mesajı ürün adını ve ürün bağlantısını içeriyor.
- [ ] "Paylaş": mobilde sistem paylaşım menüsü, masaüstünde "Kopyalandı".
- [ ] [oto] Mobilde alt iletişim çubuğu (WhatsApp / Ara / Yol tarifi) görünüyor ve sayfa altbilgisini örtmüyor; masaüstünde görünmüyor.
- [ ] WhatsApp, telefon ve konum bilgisi olmayan mağazada alt çubuk hiç çıkmıyor.

## Aşama 5 — Yönetim paneli

- [ ] [oto] Giriş yapılmamışken `/yonetim` ve `/dukkan-ayarlari/urunler` giriş kartı gösteriyor; giriş bağlantısı `?next=` ile aynı sayfaya dönüş adresini taşıyor. Giriş sonrası gerçekten o sayfaya dönüldüğünü elle doğrulayın.
- [ ] [oto] Ana sayfada sıra: hızlı işlemler → profil skoru + Esnaf Koçu → Tüm modüller.
- [ ] "Ürün ekle" ürün yönetimine, "Servis kayıtları" servis listesine gidiyor.
- [ ] "Vitrini paylaş": mobilde sistem paylaşım menüsü, desteklenmeyen tarayıcıda bağlantı panoya kopyalanıyor.
- [ ] [oto] Skor kartına dokununca döküm paneli açılıyor; Escape ile kapanıyor.
- [ ] Dökümde eksik maddeler doğru bölüme götürüyor (Logo → Görseller, Konum → Konum, Yerel blog → yeni yazı). [oto: bağlantı eşlemesi]
- [ ] Menü adları: "2. El Cihazlar", "Aksesuar Kataloğu".
- [ ] [oto] Mobilde alt sekme çubuğu görünüyor (Ana sayfa, Ürünler, Servis, Daha fazla); masaüstünde görünmüyor.
- [ ] [oto] "Daha fazla" diğer bölümleri alttan açılan panelde listeliyor.
- [ ] Etkin sekme vurgulanıyor (ör. Blog sayfasındayken "Daha fazla").
- [ ] [oto] Ürünler sayfasında mobilde: değişiklik yokken yalnızca sekme çubuğu; değişiklik yapınca kaydet çubuğu sekme çubuğunun yerini alıyor; İptal sonrası sekme çubuğu geri geliyor.
- [ ] Aynı davranış Dükkan Ayarları sayfasında da geçerli.
- [ ] Sekme çubuğu ve kaydet çubuğu sayfa içeriğinin son satırını örtmüyor.

## Genel — erişilebilirlik ve performans

- [ ] Tüm dokunma hedefleri en az 44 px.
- [ ] Klavye ile (Tab / Shift+Tab / Enter / Escape) tüm panel, pencere ve menüler kullanılabiliyor; açılan pencerede odak içeride başlıyor.
- [ ] Ekran okuyucu: pencerelerin başlığı okunuyor; simge düğmelerinin `aria-label` metni var.
- [ ] İşletim sisteminde "hareketi azalt" açıkken animasyonlar kısa veya kapalı.
- [ ] Yavaş 4G simülasyonunda (DevTools) vitrin ilk görünümü kabul edilebilir sürede yükleniyor; görseller tembel (lazy) yükleniyor.
- [ ] Konsolda hata yok; Supabase hataları `logDukkanAction` ile kayda geçiyor ve kullanıcıya Türkçe mesaj gösteriliyor.
