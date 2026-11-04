import type { Metadata } from "next";
import { SaticiBilgiTablosu, YasalSayfa } from "@/components/abonelik/yasal-sayfa";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu | EsnafPRO",
  robots: { index: false, follow: true },
};

export default function OnBilgilendirmeFormuPage() {
  const { bilgiler } = getSaticiBilgileri();

  return (
    <YasalSayfa baslik="Ön Bilgilendirme Formu">
      <h2>1. Satıcı bilgileri</h2>
      <SaticiBilgiTablosu satici={bilgiler} />

      <h2>2. Hizmetin konusu ve temel nitelikleri</h2>
      <p>
        EsnafPRO; telefon ve teknik servis işletmeleri için dijital vitrin, stok, kasa ve
        pazaryeri araçları sunan bir yazılım hizmetidir. Ücretli paketler (Büyüme ve Pro), seçilen
        süre boyunca (1, 3 veya 12 ay) ilgili paketin özelliklerine erişim hakkı verir. Paket
        içerikleri fiyatlandırma sayfasında listelenir.
      </p>

      <h2>3. Fiyat ve ödeme</h2>
      <p>
        Fiyatlar Türk Lirası cinsinden olup KDV dahildir. Ödeme, iyzico altyapısı üzerinden kredi
        veya banka kartı ile tek seferde alınır; taksit uygulanmaz. Kart bilgileri EsnafPRO
        tarafından saklanmaz.
      </p>

      <h2>4. Süre ve yenileme</h2>
      <p>
        Abonelik, ödemenin onaylanmasıyla hemen başlar ve seçilen sürenin sonunda kendiliğinden
        sona erer. Otomatik yenileme ve otomatik tahsilat yapılmaz. Aynı paket süresi bitmeden
        yeniden satın alınırsa yeni süre mevcut sürenin sonuna eklenir. Büyüme paketinden Pro
        paketine geçişte Pro süresi ödeme anından başlar.
      </p>

      <h2>5. İfa ve teslim</h2>
      <p>
        Hizmet elektronik ortamda sunulur; ödemenin onaylanmasının ardından paket özellikleri
        hesabınıza anında tanımlanır. Fiziksel teslimat yapılmaz.
      </p>

      <h2>6. Cayma hakkı</h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği uyarınca elektronik ortamda anında ifa edilen hizmetlere
        ilişkin sözleşmelerde cayma hakkı kullanılamaz. Hizmet ödeme onayı ile birlikte anında ifa
        edildiğinden, satın alma işleminden sonra cayma hakkı bulunmamaktadır.
      </p>

      <h2>7. Şikâyet ve itirazlar</h2>
      <p>
        Talep ve şikâyetlerinizi yukarıdaki iletişim bilgileri üzerinden iletebilirsiniz.
        Tüketiciler, yasal parasal sınırlar dahilinde yerleşim yerlerindeki tüketici hakem
        heyetlerine veya tüketici mahkemelerine başvurabilir.
      </p>
    </YasalSayfa>
  );
}
