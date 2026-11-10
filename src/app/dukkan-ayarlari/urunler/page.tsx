import { redirect } from "next/navigation";
import { URUNLER_PATH } from "@/lib/yonetim/nav";

/**
 * Ürün yönetimi mağaza ayarlarından çıkıp /yonetim/urunler altına taşındı.
 * Eski bağlantılar ve yer imleri kırılmasın diye rota yönlendirme olarak kalır.
 */
export default function DukkanAyarlariUrunlerPage() {
  redirect(URUNLER_PATH);
}
