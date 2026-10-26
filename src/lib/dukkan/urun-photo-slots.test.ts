import { describe, expect, it } from "vitest";
import { emptyUrunItem } from "@/components/dukkan/product-photo-editor";
import {
  getUrunPhotoList,
  MAX_URUN_PHOTO_SLOTS,
  setUrunPhotoList,
} from "@/lib/dukkan/urun-photo-slots";

describe("ürün fotoğraf yuvaları", () => {
  it("ürün başına 8 fotoğraf yuvası vardır", () => {
    expect(MAX_URUN_PHOTO_SLOTS).toBe(8);
  });

  it("boş yuvaları atlayıp sırayı korur", () => {
    const item = {
      ...emptyUrunItem(),
      fotograf_url: "a",
      fotograf_url_3: " c ",
      fotograf_url_8: "h",
    };
    expect(getUrunPhotoList(item)).toEqual(["a", "c", "h"]);
  });

  it("listeyi boşluksuz yazar ve kalan yuvaları temizler", () => {
    const item = { ...emptyUrunItem(), urun_adi: "Kılıf", fotograf_url_5: "eski" };
    const next = setUrunPhotoList(item, ["x", "y"]);

    expect(next.fotograf_url).toBe("x");
    expect(next.fotograf_url_2).toBe("y");
    expect(next.fotograf_url_5).toBe("");
    expect(next.urun_adi).toBe("Kılıf");
    expect(item.fotograf_url_5).toBe("eski");
  });

  it("sıralama değişince kapak (ilk fotoğraf) güncellenir", () => {
    const item = setUrunPhotoList(emptyUrunItem(), ["a", "b", "c"]);
    const reordered = setUrunPhotoList(item, ["c", "a", "b"]);
    expect(getUrunPhotoList(reordered)[0]).toBe("c");
  });
});
