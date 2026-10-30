// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  emptyUrunItem,
  normalizeUrunItems,
  UrunHiddenFields,
  type UrunFormItem,
} from "@/components/dukkan/product-photo-editor";
import { parseUrunlerFromFormData } from "@/lib/dukkan/form-data";
import { makeUrun } from "@/test/factories";

vi.mock("@/lib/supabase/upload-dukkan-image", () => ({ uploadDukkanImage: vi.fn() }));

function submit(items: UrunFormItem[]) {
  const form = document.createElement("form");
  form.innerHTML = renderToStaticMarkup(
    <>
      {items.map((item, index) => (
        <UrunHiddenFields key={index} index={index} item={item} />
      ))}
    </>
  );
  return parseUrunlerFromFormData(new FormData(form));
}

describe("UrunHiddenFields ↔ parseUrunlerFromFormData", () => {
  it("ürünün tüm alanları gizli alanlardan kayıpsız geri okunur (sil-yeniden-yaz senkronu)", () => {
    const urunler = [
      makeUrun({
        urun_adi: "iPhone 15 Kılıf",
        urun_aciklama: "Şeffaf\nDarbe emici",
        fotograf_url: "https://cdn.test/1.webp",
        fotograf_url_2: "https://cdn.test/2.webp",
        fotograf_url_8: "https://cdn.test/8.webp",
        urun_kategorisi: "Kılıf",
        fiyat: "250 TL",
        stok_adedi: 0,
        barkod: "8690000000017",
        gorsel_orani: "dikey",
      }),
      makeUrun({ urun_adi: "Şarj kablosu", stok_adedi: 7 }),
    ];

    const parsed = submit(normalizeUrunItems(urunler));

    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({
      id: urunler[0].id,
      urun_adi: "iPhone 15 Kılıf",
      urun_aciklama: "Şeffaf\nDarbe emici",
      fotograf_url: "https://cdn.test/1.webp",
      fotograf_url_2: "https://cdn.test/2.webp",
      fotograf_url_3: null,
      fotograf_url_4: null,
      fotograf_url_5: null,
      fotograf_url_6: null,
      fotograf_url_7: null,
      fotograf_url_8: "https://cdn.test/8.webp",
      urun_kategorisi: "Kılıf",
      fiyat: "250 TL",
      stok_adedi: 0,
      barkod: "8690000000017",
      gorsel_orani: "dikey",
    });
    expect(parsed[1]).toMatchObject({ id: urunler[1].id, urun_adi: "Şarj kablosu", stok_adedi: 7 });
  });

  it("yeni (id'siz) ürün id olmadan gönderilir", () => {
    const [parsed] = submit([{ ...emptyUrunItem(), urun_adi: "Yeni", fotograf_url: "a.webp" }]);
    expect(parsed.id).toBeUndefined();
  });
});
