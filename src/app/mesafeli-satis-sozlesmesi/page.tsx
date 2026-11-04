import type { Metadata } from "next";
import Link from "next/link";
import { SaticiBilgiTablosu, YasalSayfa } from "@/components/abonelik/yasal-sayfa";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | EsnafPRO",
  robots: { index: false, follow: true },
};

export default function MesafeliSatisSozlesmesiPage() {
  const { bilgiler } = getSaticiBilgileri();

  return (
    <YasalSayfa baslik="Mesafeli Satış Sözleşmesi">
      <h2>Madde 1 — Taraflar</h2>
      <p>
        İşbu sözleşme, aşağıda bilgileri yer alan satıcı ile EsnafPRO üzerinden ücretli paket satın
        alan kullanıcı (&quot;Alıcı&quot;) arasında, Alıcı&apos;nın ödeme adımında sözleşmeyi
        onaylamasıyla elektronik ortamda kurulmuştur. Alıcı bilgileri, ödeme sırasında girilen
        fatura bilgileridir.
      </p>
      <SaticiBilgiTablosu satici={bilgiler} />

      <h2>Madde 2 — Konu</h2>
      <p>
        Sözleşmenin konusu, Alıcı&apos;nın seçtiği EsnafPRO paketine (Büyüme veya Pro) seçilen süre
        (1, 3 veya 12 ay) boyunca erişim hizmetinin sağlanması ve bedelinin ödenmesidir. Paket
        kapsamı, satın alma anında fiyatlandırma sayfasında yayımlanan özelliklerdir.
      </p>

      <h2>Madde 3 — Bedel ve ödeme</h2>
      <p>
        Hizmet bedeli, ödeme sayfasında gösterilen KDV dahil tutardır ve iyzico üzerinden tek
        seferde tahsil edilir. Taksit uygulanmaz, otomatik yenileme yapılmaz. Fatura, Alıcı&apos;nın
        girdiği bilgilere göre düzenlenir ve e-posta ile iletilir.
      </p>

      <h2>Madde 4 — İfa</h2>
      <p>
        Hizmet, ödemenin onaylanmasıyla Alıcı&apos;nın hesabına anında tanımlanır ve seçilen sürenin
        sonunda sona erer. Satıcı, hizmetin kesintisiz sunulması için makul özeni gösterir; planlı
        bakım ve mücbir sebeplerden kaynaklanan kesintilerden sorumlu tutulamaz.
      </p>

      <h2>Madde 5 — Cayma hakkı</h2>
      <p>
        Hizmet elektronik ortamda anında ifa edildiğinden, Mesafeli Sözleşmeler Yönetmeliği
        uyarınca cayma hakkı bulunmamaktadır. Alıcı, ödeme adımında bu durumu bildiğini kabul eder.
      </p>

      <h2>Madde 6 — Alıcı&apos;nın yükümlülükleri</h2>
      <p>
        Alıcı, fatura bilgilerinin doğru olduğunu, hesabını hukuka ve kullanım koşullarına uygun
        kullanacağını kabul eder. Hukuka aykırı kullanım hâlinde Satıcı hizmeti askıya alabilir.
      </p>

      <h2>Madde 7 — Uyuşmazlıklar</h2>
      <p>
        Uyuşmazlıklarda, yasal parasal sınırlar dahilinde tüketici hakem heyetleri ve tüketici
        mahkemeleri; tacir sıfatıyla satın alımlarda Satıcı&apos;nın yerleşim yerindeki mahkemeler
        yetkilidir.
      </p>

      <h2>Madde 8 — Yürürlük</h2>
      <p>
        Alıcı, <Link href="/on-bilgilendirme-formu" className="text-emerald-700 underline">ön
        bilgilendirme formunu</Link> okuduğunu ve bu sözleşmeyi ödeme adımında elektronik olarak
        onayladığını kabul eder. Sözleşme onay anında yürürlüğe girer.
      </p>
    </YasalSayfa>
  );
}
