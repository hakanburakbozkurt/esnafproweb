import type { Metadata } from "next";
import { SaticiBilgiTablosu, YasalSayfa } from "@/components/abonelik/yasal-sayfa";
import { getSaticiBilgileri } from "@/lib/abonelik/satici-bilgileri";

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

      <h2>1. Hesap</h2>
      <p>
        Hesabınızın güvenliğinden ve hesapta yapılan işlemlerden siz sorumlusunuz. Doğru bilgi
        vermeniz gerekir.
      </p>

      <h2>2. Yayımlanan içerik</h2>
      <p>
        Vitrin, ürün, cihaz ve görsellerde yalnızca hakkınızda olan ya da kullanma hakkınız bulunan
        içerikleri yayımlayabilirsiniz. Marka ve telif haklarına aykırı içerik kaldırılabilir.
      </p>

      <h2>3. Yasaklı kullanım</h2>
      <p>
        Yanıltıcı ilan, sahte garanti veya orijinallik beyanı, başkasının kişisel verisini izinsiz
        paylaşma ve platformu kötüye kullanma yasaktır.
      </p>

      <h2>4. Ücretli paketler</h2>
      <p>
        Ücretli paketlerin koşulları ve cayma hakkı konusundaki bilgiler mesafeli satış
        sözleşmesinde yer alır.
      </p>

      <h2>5. Sorumluluk sınırı</h2>
      <p>
        Platform, ilanların ve satıcıların doğruluğunu garanti etmez. Alım satım sırasında
        yaşanan uyuşmazlıklar tarafların kendi arasındadır. Hizmet kesintilerinden doğan dolaylı
        zararlardan sorumluluk kabul edilmez.
      </p>

      <h2>6. Hesabın askıya alınması</h2>
      <p>
        Bu koşulların ihlali halinde hesap askıya alınabilir veya kapatılabilir.
      </p>
    </YasalSayfa>
  );
}
