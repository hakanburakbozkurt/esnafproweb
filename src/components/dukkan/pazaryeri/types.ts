import type { PazaryeriUrunDurumu, PazaryeriUrunu } from "@/types/database.types";

export type PazaryeriBaglantiOzeti = {
  saticiId: string;
  sonTestBasarili: boolean | null;
  sonTestAt: string | null;
};

export type PazaryeriSayfaUrunu = {
  id: string;
  urunAdi: string;
  barkod: string | null;
  fiyat: string | null;
  stokAdedi: number | null;
  fotografUrl: string | null;
  trendyol: PazaryeriUrunu | null;
};

export const DURUM_ETIKETLERI: Record<
  PazaryeriUrunDurumu,
  { label: string; className: string }
> = {
  taslak: { label: "Taslak", className: "bg-slate-100 text-slate-600 ring-slate-500/15" },
  gonderildi: {
    label: "Trendyol'a iletildi",
    className: "bg-sky-50 text-sky-700 ring-sky-600/15",
  },
  onay_bekliyor: {
    label: "Trendyol onayında",
    className: "bg-amber-50 text-amber-800 ring-amber-600/20",
  },
  yayinda: {
    label: "Trendyol'da yayında",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  },
  hata: { label: "Gönderilemedi", className: "bg-red-50 text-red-700 ring-red-600/15" },
};
