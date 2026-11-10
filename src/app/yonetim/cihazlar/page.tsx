import { redirect } from "next/navigation";
import { urunlerTabHref } from "@/lib/yonetim/nav";

/**
 * Cihaz yönetimi Ürünler sayfasının "2. El" sekmesine taşındı.
 * Eski bağlantılar ve yer imleri kırılmasın diye rota yönlendirme olarak kalır.
 * CihazlarClient aynı klasörde durur; yeni sayfa onu buradan içeri alır.
 */
export default function CihazlarYonetimPage() {
  redirect(urunlerTabHref("ikinci-el"));
}
