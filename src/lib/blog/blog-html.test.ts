import { describe, expect, it } from "vitest";
import { resolveBlogSeoTitle } from "./blog-html";

describe("resolveBlogSeoTitle", () => {
  it("dükkan adını bir kez ekler, EsnafPRO eklemez", () => {
    expect(
      resolveBlogSeoTitle(null, "Bahçeşehir'de iPhone 17 ve iPhone 18 Serisi", "Redikom Mobile Store")
    ).toBe("Bahçeşehir'de iPhone 17 ve iPhone 18 Serisi | Redikom Mobile Store");
  });

  it("başlıkta dükkan adı zaten varsa tekrar eklemez", () => {
    expect(
      resolveBlogSeoTitle(
        "Bahçeşehir'de iPhone 17 ve iPhone 18 Serisi | Redikom Mobile Store",
        "x",
        "Redikom Mobile Store"
      )
    ).toBe("Bahçeşehir'de iPhone 17 ve iPhone 18 Serisi | Redikom Mobile Store");
  });

  it("özel meta başlığı baslık yerine kullanır", () => {
    expect(resolveBlogSeoTitle("Özel Başlık", "Yazı", "Dükkan")).toBe("Özel Başlık | Dükkan");
  });
});
