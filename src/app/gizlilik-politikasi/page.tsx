import type { Metadata } from "next";
import { SaticiBilgiTablosu, YasalSayfa } from "@/components/abonelik/yasal-sayfa";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | EsnafPRO",
  description: "EsnafPRO'nun kişisel verilerin işlenmesine ilişkin gizlilik politikası.",
  alternates: { canonical: "/gizlilik-politikasi" },
};

export default function GizlilikPolitikasiPage() {
  const { bilgiler } = getSaticiBilgileri();

  return (
    <YasalSayfa baslik="Gizlilik Politikası">
      <p>
        Bu politika, EsnafPRO platformunu kullanırken hangi kişisel verilerin toplandığını, neden
        işlendiğini ve nasıl korunduğunu açıklar. Kişisel verileriniz, 6698 sayılı Kişisel Verilerin
        Korunması Kanunu (KVKK) kapsamında işlenir.
      </p>
      <SaticiBilgiTablosu satici={bilgiler} />

      <h2>1. Toplanan veriler</h2>
      <p>
        Hesap oluşturma sırasında e-posta adresiniz ve şifreniz (şifre yalnızca özetlenmiş biçimde
        saklanır). Dükkan ve vitrin oluşturduğunuzda işletme adı, adres, telefon, WhatsApp ve
        görseller. Ürün ve cihaz kayıtlarında girdiğiniz bilgiler. Ödeme yaptığınızda fatura
        bilgileri; kart bilgileri EsnafPRO tarafından saklanmaz, ödeme iyzico tarafından alınır.
      </p>

      <h2>2. İşleme amaçları</h2>
      <p>
        Hesabınızı oluşturmak ve yönetmek, vitrininizi yayınlamak, abonelik ve fatura süreçlerini
        yürütmek, teknik destek sağlamak ve platformun güvenliğini korumak.
      </p>

      <h2>3. Verilerin paylaşımı</h2>
      <p>
        Vitrininizde ve pazaryerinde yayımladığınız işletme bilgileri (telefon, WhatsApp, adres
        gibi) herkes tarafından görülebilir. Ödeme işlemleri için iyzico, hesap altyapısı için
        Supabase, barındırma için Vercel hizmet sağlayıcı olarak çalışır. Verileriniz bunların dışında
        üçüncü kişilerle satılmaz.
      </p>

      <h2>4. Çerezler</h2>
      <p>
        Oturumunuzu sürdürmek için zorunlu çerezler kullanılır. Harita görüntülemede üçüncü taraf
        sunucuların çerez bırakabileceğini unutmayın.
      </p>

      <h2>5. Haklarınız</h2>
      <p>
        KVKK&apos;nın 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltme,
        silme ve itiraz etme haklarına sahipsiniz. Taleplerinizi aşağıdaki iletişim adresine
        iletebilirsiniz.
      </p>

      <h2>6. Değişiklikler</h2>
      <p>
        Bu politika gerektiğinde güncellenebilir. Güncel sürüm bu sayfada yayımlanır.
      </p>
    </YasalSayfa>
  );
}
