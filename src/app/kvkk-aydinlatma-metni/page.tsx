import type { Metadata } from "next";
import { SaticiBilgiTablosu, YasalSayfa } from "@/components/abonelik/yasal-sayfa";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";
import { SITE_CONTACT } from "@/lib/site/contact";

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
        sorumlusunun kimliğini, kişisel verilerin hangi amaçla ve hangi hukuki sebeple işlendiğini,
        kime ve hangi amaçla aktarılabileceğini ve veri sahibinin haklarını açıklamak için
        hazırlanmıştır.
      </p>
      <SaticiBilgiTablosu satici={bilgiler} />

      <h2>1. Kişisel verilerin kaynağı</h2>
      <p>
        Verileriniz üç yoldan elde edilir: (a) hesabınızı kendiniz oluşturup bilgilerinizi girmeniz,
        (b) EsnafPRO ekibinin sizin adınıza sayfa kurarken, sizinle WhatsApp, telefon veya e-posta
        üzerinden paylaştığınız bilgilerle, (c) işletmenize ait, kamuya açık kaynaklarda (ör. Google
        İşletme Profili) yer alan iletişim ve adres bilgileriyle. Üçüncü yolla elde edilen bilgiler
        için ilk iletişimde sizi bilgilendiririz ve dilediğiniz zaman kaldırılmasını isteyebilirsiniz.
      </p>

      <h2>2. İşlenen kişisel veriler</h2>
      <p>
        Kimlik ve iletişim bilgileri (ad, e-posta, telefon, WhatsApp), işletme bilgileri (dükkan adı,
        adres, semt, çalışma saatleri, görseller), ürün ve cihaz kayıtları, fatura ve abonelik
        bilgileri, oturum ve teknik kayıt bilgileri.
      </p>

      <h2>3. İşleme amaçları ve hukuki sebepler</h2>
      <p>
        Sözleşmenin kurulması ve ifası (hesap, vitrin, pazaryeri, abonelik ve fatura); hukuki
        yükümlülüklerin yerine getirilmesi (fatura ve kayıt saklama); meşru menfaat (platform güvenliği,
        hata takibi ve hizmetin geliştirilmesi). Dükkan bilgilerinin ve görsellerinin herkese açık
        yayınlanması, kullanıcının bu yayın için verdiği açık rızaya dayanır ve onay kutusu işaretlenmeden
        sayfa yayına alınmaz.
      </p>

      <h2>4. Verilerin aktarımı</h2>
      <p>
        Verileriniz; ödeme işlemleri için iyzico, veritabanı ve kimlik doğrulama için Supabase, barındırma
        için Vercel ve mobil uygulamadaki yapay zeka asistanı özelliği için OpenAI ile paylaşılabilir.
        Bu hizmet sağlayıcılar yurt dışında bulunabilir veya yurt dışındaki altyapı kullanabilir; aktarım
        KVKK&apos;nın 9. maddesine uygun olarak yapılır. Yetkili kamu kurum ve kuruluşlarına, yasal
        zorunluluk olduğunda bilgi verilebilir.
      </p>

      <h2>5. Vitrin ve pazaryerinde yayımlanan bilgiler</h2>
      <p>
        Dükkan sayfanızda yayımlanan işletme bilgileri ve görseller herkes tarafından görülebilir ve
        arama motorları tarafından taranıp dizine eklenebilir. Bu bilgileri panelden dilediğiniz zaman
        değiştirebilir veya sayfanızı kapatabilirsiniz; arama motorlarındaki önbelleklerin güncellenmesi
        zaman alabilir.
      </p>

      <h2>6. Müşteri verileri (teknik servis ve kasa kayıtları)</h2>
      <p>
        Esnaf, teknik servis takibi veya kasa kayıtlarında kendi müşterilerinin adı, telefonu ve cihaz
        bilgilerini girebilir. Bu kayıtlarda veri sorumlusu, verileri topladığı müşterilerine karşı o
        esnaftır. EsnafPRO bu verileri esnaf adına, esnafın talimatıyla işleyen konumundadır. Esnaf,
        müşterilerine kendi aydınlatma yükümlülüğünü yerine getirmekten sorumludur.
      </p>

      <h2>7. Toplama yöntemi</h2>
      <p>
        Veriler kayıt ve profil formları, ürün ve cihaz formları, ödeme adımı, WhatsApp ve telefon
        görüşmeleri yoluyla elektronik ortamda veya yazılı olarak toplanır.
      </p>

      <h2>8. Saklama süresi</h2>
      <p>
        Verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama süreleri dolana kadar
        saklanır. Hesabınızı kapattığınızda, yasal yükümlülükler saklı kalmak üzere veriler silinir veya
        anonim hâle getirilir.
      </p>

      <h2>9. Haklarınız</h2>
      <p>
        KVKK&apos;nın 11. maddesinde sayılan haklarınızı, yani verilerinizin işlenip işlenmediğini
        öğrenme, işlenmişse bilgi talep etme, düzeltme, silme veya yok edilmesini isteme, bu işlemlerin
        aktarıldığı üçüncü kişileri öğrenme ve zararın giderilmesini talep etme haklarını veri
        sorumlusuna başvurarak kullanabilirsiniz. Başvurularınızı {SITE_CONTACT.email} adresine
        iletebilirsiniz. Başvurular, Kişisel Verileri Koruma Kurulu&apos;nun belirlediği usul ve esaslara
        göre en geç otuz gün içinde yanıtlanır.
      </p>
    </YasalSayfa>
  );
}
