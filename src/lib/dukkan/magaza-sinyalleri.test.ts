import { describe, expect, it } from "vitest";
import { buildLocalBusinessJsonLd, formatSchemaTelefon } from "@/lib/dukkan/json-ld";
import { buildDukkanPageMetadata } from "@/lib/dukkan/metadata";
import type { Dukkan } from "@/types/database.types";

describe("formatSchemaTelefon", () => {
  it.each([
    ["905539559111", "+905539559111"],
    ["0553 955 91 11", "+905539559111"],
    ["553 955 91 11", "+905539559111"],
    ["+90 553 955 91 11", "+905539559111"],
    ["", null],
  ])("%s → %s", (girdi, beklenen) => {
    expect(formatSchemaTelefon(girdi)).toBe(beklenen);
  });
});

describe("mağaza Google sinyalleri", () => {
  const redikom = {
    dukkan_adi: "Redikom Mobile Store",
    slug: "redikom",
    adres: "Süzer Bulvarı Kelebek Sokak\r\nBahçeşehir 2.Kısım Mahallesi\r\n 34488",
    telefon: "905321112233",
    whatsapp: null,
    google_business_url: "https://maps.app.goo.gl/ornek",
    instagram_url: null,
    tiktok_url: null,
    facebook_url: null,
    enlem: 41.06,
    boylam: 28.68,
  } as unknown as Dukkan;

  it("telefoncu türü, Google profili ve harita linki", () => {
    const schema = buildLocalBusinessJsonLd(redikom) as Record<string, unknown>;
    expect(schema["@type"]).toBe("MobilePhoneStore");
    expect(schema.telephone).toBe("+905321112233");
    expect(schema.sameAs).toEqual(["https://maps.app.goo.gl/ornek"]);
    expect(schema.hasMap).toBe("https://maps.app.goo.gl/ornek");
  });

  it("başlığı yazılmamış mağazada konum + meslek, yazılmışsa esnafın başlığı", () => {
    expect(buildDukkanPageMetadata({ ...redikom, meta_title: null } as never).title).toBe(
      "Redikom Mobile Store — Bahçeşehir, Başakşehir Telefoncu | EsnafPRO"
    );
    expect(buildDukkanPageMetadata({ ...redikom, meta_title: "Özel Başlık" } as never).title).toBe("Özel Başlık");
  });
});
