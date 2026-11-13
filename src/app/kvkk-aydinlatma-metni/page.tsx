import type { Metadata } from "next";
import { SaticiBilgiTablosu, YasalSayfa } from "@/components/abonelik/yasal-sayfa";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | EsnafPRO",
  description: "6698 sayılı KVKK kapsamında EsnafPRO aydınlatma metni.",
  alternates: { canonical: "/kvkk-aydinlatma-metni" },
};

export default function KvkkAydinlatmaMetniPage() {
  const { bilgiler } = getSaticiBilgileri();

  return (
    <YasalSayfa baslik="KVKK Aydınlatma Metni">
      <p>
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 10. maddesi uyarınca veri
        sorumlusunun kimliğini ve kişisel verilerin işlenmesine ilişkin bilgileri açıklamak için
        hazırlanmıştır.
      </p>
      <SaticiBilgiTablosu satici={bilgiler} />

      <h2>Hangi veriler işlenir</h2>
      <p>
        Kimlik ve iletişim bilgileri (ad, e-posta, telefon), işletme bilgileri (adres, görseller),
        ürün ve cihaz kayıtları, fatura ve abonelik bilgileri, oturum ve teknik kayıtlar.
      </p>

      <h2>İşleme amaçları ve hukuki sebepler</h2>
      <p>
        Sözleşmenin kurulması ve ifası (hesap, vitrin, abonelik), hukuki yükümlülüklerin yerine
        getirilmesi (fatura ve kayıt saklama), meşru menfaat (platform güvenliği ve hata
        takibi). Açık rıza gerektiren işlemler için ayrıca onay alınır.
      </p>

      <h2>Aktarım</h2>
      <p>
        Verileriniz; ödeme işlemleri için iyzico, veritabanı ve kimlik doğrulama için Supabase,
        barındırma için Vercel ile paylaşılabilir. Yurt dışına aktarım bu hizmet sağlayıcıların
        altyapısı üzerinden gerçekleşebilir.
      </p>

      <h2>Toplama yöntemi ve hukuki sebep</h2>
      <p>
        Verileriniz kayıt formları, ürün ve cihaz formları ile ödeme adımından elektronik ortamda
        toplanır.
      </p>

      <h2>Haklarınız</h2>
      <p>
        KVKK&apos;nın 11. maddesinde sayılan haklarınızı veri sorumlusuna başvurarak kullanabilirsiniz.
        Başvurular, Kişisel Verileri Koruma Kurulu&apos;nun belirlediği usul ve esaslara göre
        ele alınır.
      </p>
    </YasalSayfa>
  );
}
