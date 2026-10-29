// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/pazaryeri/trendyol-actions", () => ({
  trendyolBaglantiKaydet: vi.fn(),
  trendyolBaglantiSil: vi.fn(),
  trendyolBaglantiTest: vi.fn(),
  trendyolDurumYenile: vi.fn(),
  trendyolStokFiyatGonder: vi.fn(),
  trendyolKategoriAra: vi.fn(),
  trendyolKategoriOzellikleri: vi.fn(),
  trendyolMarkaAra: vi.fn(),
  trendyolUrunGonder: vi.fn(),
}));

import { TrendyolBaglantiKarti } from "@/components/dukkan/pazaryeri/trendyol-baglanti-karti";
import { TrendyolUrunListesi } from "@/components/dukkan/pazaryeri/trendyol-urun-listesi";
import type { PazaryeriSayfaUrunu } from "@/components/dukkan/pazaryeri/types";

const base: PazaryeriSayfaUrunu = {
  id: "1",
  urunAdi: "iPhone 15 Kılıf",
  barkod: "KLF-15",
  fiyat: "250 TL",
  stokAdedi: 3,
  fotografUrl: null,
  trendyol: null,
};

describe("pazaryeri arayüzü", () => {
  it("bağlantı yokken kurulum adımlarını ve formu gösterir", () => {
    const html = renderToStaticMarkup(<TrendyolBaglantiKarti baglanti={null} />);
    expect(html).toContain("Entegrasyon Bilgileri");
    expect(html).toContain('name="api_secret"');
    expect(html).toContain('type="password"');
  });

  it("bağlıyken satıcı ID'yi gösterir, formu gizler", () => {
    const html = renderToStaticMarkup(
      <TrendyolBaglantiKarti baglanti={{ saticiId: "4321", sonTestBasarili: true, sonTestAt: null }} />
    );
    expect(html).toContain("Satıcı ID");
    expect(html).toContain("4321");
    expect(html).not.toContain('name="api_secret"');
  });

  it("barkodsuz ve tekrarlı barkodlu ürünü göndermeye izin vermez", () => {
    const html = renderToStaticMarkup(
      <TrendyolUrunListesi
        urunler={[
          { ...base, id: "a", barkod: null },
          { ...base, id: "b" },
          { ...base, id: "c" },
        ]}
      />
    );
    expect(html).toContain("ürüne barkod ekleyin");
    expect(html).toContain("Bu barkod başka bir üründe de var");
    const doc = new DOMParser().parseFromString(html, "text/html");
    const gonderButonlari = [...doc.querySelectorAll("button")].filter((b) =>
      b.textContent?.includes("Trendyol’a gönder")
    );
    expect(gonderButonlari.map((b) => b.disabled)).toEqual([true, true, true]);
  });
});
