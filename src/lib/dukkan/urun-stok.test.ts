import { describe, expect, it } from "vitest";
import { getUrunStokBadge } from "@/lib/dukkan/urun-stok";

describe("getUrunStokBadge", () => {
  it("stok girilmemişse rozet göstermez", () => {
    expect(getUrunStokBadge(null)).toBeNull();
    expect(getUrunStokBadge(undefined)).toBeNull();
    expect(getUrunStokBadge("")).toBeNull();
  });

  it("geçersiz değerlerde rozet göstermez", () => {
    expect(getUrunStokBadge("-1")).toBeNull();
    expect(getUrunStokBadge("2.5")).toBeNull();
    expect(getUrunStokBadge("abc")).toBeNull();
  });

  it("0 → Tükendi, 1 → Son 1 adet, >1 → Stokta", () => {
    expect(getUrunStokBadge(0)).toEqual({ label: "Tükendi", tone: "danger" });
    expect(getUrunStokBadge("1")).toEqual({ label: "Son 1 adet", tone: "warning" });
    expect(getUrunStokBadge(12)).toEqual({ label: "Stokta", tone: "success" });
    expect(getUrunStokBadge(" 3 ")).toEqual({ label: "Stokta", tone: "success" });
  });
});
