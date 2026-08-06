export type FaqContext = "anasayfa" | "fiyatlandirma";

export type PlatformFaq = {
  id: string;
  soru: string;
  cevap: string;
  sort_order: number;
  is_active: boolean;
  context: FaqContext;
};

export const FAQ_CONTEXT_LABELS: Record<FaqContext, string> = {
  anasayfa: "Ana Sayfa (esnafpro.app)",
  fiyatlandirma: "Fiyatlandırma Sayfası",
};
