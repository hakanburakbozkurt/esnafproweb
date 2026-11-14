import type { Metadata } from "next";
import { SaticiBilgiTablosu, YasalSayfa } from "@/components/abonelik/yasal-sayfa";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";
import { SITE_CONTACT } from "@/lib/site/contact";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | EsnafPRO",
  description: "EsnafPRO platformunun kullanım koşulları ve üyelik şartları.",
  alternates: { canonical: "/kullanim-kosullari" },
};

export default function KullanimKosullariPage() {
  const { bilgiler } = getSaticiBilgileri();

  return (
    <YasalSayfa baslik="Kullanım Koşulları">
      <p>
        EsnafPRO&apos;yu kullanarak bu koşulları kabul etmiş olursunuz. Kabul etmiyorsanız
        platformu kullanmayın.
      </p>
      <SaticiBilgiTablosu satici={bilgiler} />

      <h2>1. Hesap ve kurulum</h2>
      <p>
        Hesabınızın güvenliğinden ve hesapta yapılan işlemlerden siz sorumlusunuz; doğru bilgi vermeniz
        gerekir. EsnafPRO ekibi, sizin talebiniz üzerine mağaza sayfanızı sizin adınıza kurabilir. Bu
        durumda sayfa, siz davet bağlantısıyla şifrenizi belirleyip kullanım koşullarını ve yayın onayını
        verene kadar Google&apos;a açılmaz.
      </p>

      <h2>2. Yayımlanan içerik ve görseller</h2>
      <p>
        Vitrin, ürün, cihaz ve görsellerde yalnızca hakkınızda olan ya da kullanma hakkınız bulunan
        içerikleri yayımlayabilirsiniz. Yüklediğiniz görsellerin telif ve kişilik haklarını ihlal
        etmediğini, gerekli izinlere sahip olduğunuzu beyan edersiniz. Haklarına aykırı içerik
        kaldırılabilir.
      </p>

      <h2>3. Müşteri verileri</h2>
      <p>
        Teknik servis ve kasa kayıtlarında kendi müşterilerinizin verilerini girdiğinizde, bu verilerin
        KVKK kapsamındaki veri sorumlusu sizsiniz. Müşterilerinizi bilgilendirmek, gerekli izinleri
        almak ve verileri hukuka uygun işlemek sizin yükümlülüğünüzdedir. Ayrıntılar KVKK Aydınlatma
        Metni&apos;nde yer alır.
      </p>

      <h2>4. Yasaklı kullanım</h2>
      <p>
        Yanıltıcı ilan, sahte garanti veya orijinallik beyanı, sahte yorum ya da sahte Google
        değerlendirmesi, başkasının kişisel verisini izinsiz paylaşma, spam ve toplu istenmeyen mesaj
        gönderimi ve platformu kötüye kullanma yasaktır.
      </p>

      <h2>5. Ücretli paketler</h2>
      <p>
        Ücretli paketlerin koşulları ve cayma hakkı konusundaki bilgiler mesafeli satış sözleşmesinde yer
        alır. Ücretler KDV dahil olarak gösterilir.
      </p>

      <h2>6. Sorumluluk sınırı</h2>
      <p>
        Platform, ilanların ve satıcıların doğruluğunu garanti etmez. Alım satım sırasında yaşanan
        uyuşmazlıklar tarafların kendi arasındadır. Yasal olarak kaldırılamayan haller saklı kalmak
        kaydıyla, hizmet kesintilerinden doğan dolaylı zararlardan sorumluluk kabul edilmez.
      </p>

      <h2>7. Hesabın askıya alınması</h2>
      <p>
        Bu koşulların ihlali halinde hesap askıya alınabilir veya kapatılabilir. Askıya alma
        gerekçesi sizinle paylaşılır.
      </p>

      <h2>8. Uygulanacak hukuk ve iletişim</h2>
      <p>
        Bu koşullar Türk hukukuna tabidir. Uyuşmazlıklarda İstanbul mahkemeleri ve icra daireleri yetkilidir;
        tüketici sıfatı taşıyan kullanıcılar için yasal tüketici yetkisi saklıdır. Sorularınız için:{" "}
        {SITE_CONTACT.email}.
      </p>
    </YasalSayfa>
  );
}
