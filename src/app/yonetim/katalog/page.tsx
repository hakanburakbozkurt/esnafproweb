import { redirect } from "next/navigation";
import { urunlerTabHref } from "@/lib/yonetim/nav";

/**
 * Katalog yönetimi Ürünler sayfasının "Toplu Katalog" sekmesine taşındı.
 * Eski bağlantılar ve yer imleri kırılmasın diye rota yönlendirme olarak kalır.
 */
export default function YonetimKatalogPage() {
  redirect(urunlerTabHref("katalog"));
}
