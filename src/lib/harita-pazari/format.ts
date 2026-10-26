import type { SiraDegisimi } from "@/lib/harita-pazari/rapor";

export function formatMesafe(km: number | null, kendi: boolean): string {
  if (kendi) return "Kendi konumun";
  if (km === null) return "—";
  if (km < 0.1) return "100 m'den yakın";
  return `${km.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`;
}

export function formatPuan(puan: number | null): string {
  if (puan === null) return "—";
  return puan.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function siraEtiketi(sira: number | null): { metin: string; ton: "iyi" | "orta" | "zayif" } {
  if (sira === null) return { metin: "İlk 20 dışında", ton: "zayif" };
  if (sira === 1) return { metin: "Mükemmel", ton: "iyi" };
  if (sira <= 3) return { metin: "Çok iyi", ton: "iyi" };
  if (sira <= 10) return { metin: "İyi", ton: "orta" };
  return { metin: "Geliştirilebilir", ton: "zayif" };
}

export function degisimMetni(degisim: SiraDegisimi): string {
  switch (degisim.tur) {
    case "yukseldi":
      return `Sıra yükseldi (+${degisim.fark})`;
    case "dustu":
      return `Sıra düştü (−${degisim.fark})`;
    case "sabit":
      return "Stabil";
    case "yeni":
      return "Listeye yeni girdi";
    case "listeden_cikti":
      return "İlk 20 dışına çıktı";
    case "bilinmiyor":
      return "Değişim bir sonraki taramada görünecek";
  }
}

export function karsilastirmaEtiketi(tarih: string | null, simdi = new Date()): string | null {
  if (!tarih) return null;
  const gun = Math.round((simdi.getTime() - new Date(tarih).getTime()) / (24 * 60 * 60 * 1000));
  if (gun >= 6) return "son 1 haftaya göre";
  if (gun <= 1) return "dünkü taramaya göre";
  return `${gun} gün önceki taramaya göre`;
}
