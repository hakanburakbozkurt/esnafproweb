import { describe, expect, it } from "vitest";
import { formatFiyatGirisi, formatUrunFiyatiGosterim } from "@/lib/dukkan/urun-fiyat";

describe("formatUrunFiyatiGosterim", () => {
  it("sadece rakamsa TL ve binlik ayırıcı ekler", () => {
    expect(formatUrunFiyatiGosterim("2250")).toBe("2.250 TL");
    expect(formatUrunFiyatiGosterim("1.350")).toBe("1.350 TL");
    expect(formatUrunFiyatiGosterim("99,90")).toBe("99,90 TL");
  });
  it("para birimi ya da metin varsa dokunmaz", () => {
    expect(formatUrunFiyatiGosterim("1.350 ₺")).toBe("1.350 ₺");
    expect(formatUrunFiyatiGosterim("450 TL")).toBe("450 TL");
    expect(formatUrunFiyatiGosterim("Fiyat sorunuz")).toBe("Fiyat sorunuz");
    expect(formatUrunFiyatiGosterim("200 - 300")).toBe("200 - 300");
  });
  it("boşsa null döner", () => {
    expect(formatUrunFiyatiGosterim("  ")).toBeNull();
    expect(formatUrunFiyatiGosterim(null)).toBeNull();
  });
});

describe("formatFiyatGirisi (yazarken)", () => {
  it.each([
    ["1350", "1.350"],
    ["1.3500", "13.500"],
    ["1250000", "1.250.000"],
    ["1350,5", "1.350,5"],
    ["1350,999", "1.350,99"],
    ["999", "999"],
    ["", ""],
    ["450 TL", "450 TL"],
    ["Sorunuz", "Sorunuz"],
    ["007", "7"],
  ])("%s → %s", (girdi, beklenen) => {
    expect(formatFiyatGirisi(girdi)).toBe(beklenen);
  });
});
