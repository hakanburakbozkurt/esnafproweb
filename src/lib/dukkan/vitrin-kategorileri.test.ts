import { describe, expect, it } from "vitest";
import { VITRIN_KATEGORILERI, mergeVitrinKategorileri } from "@/lib/dukkan/vitrin-kategorileri";

describe("mergeVitrinKategorileri", () => {
  it("hazır kategorileri verilen sırada başa koyar", () => {
    const sonuc = mergeVitrinKategorileri([]);
    expect(sonuc).toEqual([...VITRIN_KATEGORILERI]);
  });

  it("özel kategorileri sona, A-Z sıralı ekler ve tekrar etmez", () => {
    const sonuc = mergeVitrinKategorileri(["Zeta", "Kılıf", "Alfa"]);
    expect(sonuc.slice(0, VITRIN_KATEGORILERI.length)).toEqual([...VITRIN_KATEGORILERI]);
    expect(sonuc.slice(VITRIN_KATEGORILERI.length)).toEqual(["Alfa", "Zeta"]);
    expect(sonuc.filter((k) => k === "Kılıf")).toHaveLength(1);
  });
});
