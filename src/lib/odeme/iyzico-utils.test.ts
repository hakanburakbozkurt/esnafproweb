import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildIyzicoAuthorization,
  formatIyzicoPrice,
  sanitizeIyzicoText,
} from "@/lib/odeme/iyzico-utils";
import { tutarlarEsit } from "@/lib/odeme/tutar";

describe("iyzico-utils", () => {
  it("fiyat formatı iyzipay-node ile aynı", () => {
    expect(formatIyzicoPrice(249)).toBe("249.0");
    expect(formatIyzicoPrice(249.5)).toBe("249.5");
    expect(formatIyzicoPrice(1399)).toBe("1399.0");
  });

  it("IYZWSv2 başlığı doğru parçalardan oluşur", () => {
    const header = buildIyzicoAuthorization("api", "secret", "/p", '{"a":1}', "rnd");
    expect(header.startsWith("IYZWSv2 ")).toBe(true);
    const plain = Buffer.from(header.slice("IYZWSv2 ".length), "base64").toString("utf8");
    const imza = createHmac("sha256", "secret").update('rnd/p{"a":1}').digest("hex");
    expect(plain).toBe(`apiKey:api&randomKey:rnd&signature:${imza}`);
  });

  it("Türkçe karakterleri sadeleştirir", () => {
    expect(sanitizeIyzicoText("Şükrü Işık Çağ", 50)).toBe("Sukru Isik Cag");
    expect(sanitizeIyzicoText("   ", 10)).toBe("-");
    expect(sanitizeIyzicoText("abcdef", 3)).toBe("abc");
  });

  it("tutar karşılaştırması kuruş hassasiyetinde", () => {
    expect(tutarlarEsit("699.0", 699)).toBe(true);
    expect(tutarlarEsit("698.99", 699)).toBe(false);
  });
});
