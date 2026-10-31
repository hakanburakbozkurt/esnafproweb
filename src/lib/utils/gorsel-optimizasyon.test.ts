import { describe, expect, it } from "vitest";
import { optimizeEdilebilirGorsel } from "@/lib/utils/gorsel-optimizasyon";

const BASE = "https://dysikgsgxpfxrclgvenh.supabase.co";

describe("optimizeEdilebilirGorsel", () => {
  it("kendi depolamamızdaki herkese açık görseli kabul eder", () => {
    expect(optimizeEdilebilirGorsel(`${BASE}/storage/v1/object/public/store-assets/beep/urun/1-a.webp`)).toBe(true);
  });

  it("dış adresleri, özel (public olmayan) yolları ve geçersiz değerleri reddeder", () => {
    expect(optimizeEdilebilirGorsel("https://cdn.toptanci.com/urun.jpg")).toBe(false);
    expect(optimizeEdilebilirGorsel(`${BASE}/storage/v1/object/sign/x.jpg`)).toBe(false);
    expect(optimizeEdilebilirGorsel(`http://dysikgsgxpfxrclgvenh.supabase.co/storage/v1/object/public/x.jpg`)).toBe(false);
    expect(optimizeEdilebilirGorsel("/assets/yerel.png")).toBe(false);
    expect(optimizeEdilebilirGorsel(null)).toBe(false);
    expect(optimizeEdilebilirGorsel("")).toBe(false);
  });
});
