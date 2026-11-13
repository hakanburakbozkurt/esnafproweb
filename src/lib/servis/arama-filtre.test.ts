import { describe, expect, it } from "vitest";
import { servisAramaOrFiltresi } from "./arama-filtre";

describe("servisAramaOrFiltresi", () => {
  it("normal aramayı üç alanda çift tırnaklı deseni ile kurar", () => {
    expect(servisAramaOrFiltresi("Ali")).toBe(
      'customer_name.ilike."%Ali%",customer_phone.ilike."%Ali%",device_info.ilike."%Ali%"'
    );
  });

  it("filtre sözdizimini bozan karakterleri temizler", () => {
    const sonuc = servisAramaOrFiltresi('a),customer_name.neq.x,(b"');
    expect(sonuc).not.toMatch(/\),/);
    expect(sonuc).toContain('"%a customer name.neq.x b%"');
  });

  it("boş veya yalnızca özel karakter ise null döner", () => {
    expect(servisAramaOrFiltresi("   ")).toBeNull();
    expect(servisAramaOrFiltresi("%_,()")).toBeNull();
  });
});
