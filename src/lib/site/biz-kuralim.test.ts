import { describe, expect, it } from "vitest";
import { BIZ_KURALIM_MESAJI, buildBizKuralimUrl } from "./biz-kuralim";
import { SITE_CONTACT } from "./contact";

describe("buildBizKuralimUrl", () => {
  it("platform WhatsApp numarasına hazır mesajla gider", () => {
    const url = new URL(buildBizKuralimUrl());
    expect(url.origin + url.pathname).toBe(`https://wa.me/${SITE_CONTACT.whatsappNumber}`);
    expect(url.searchParams.get("text")).toBe(BIZ_KURALIM_MESAJI);
  });

  it("hangi sayfadan gelindiğini mesajın sonuna ekler", () => {
    const url = new URL(buildBizKuralimUrl("ana sayfa"));
    expect(url.searchParams.get("text")?.endsWith("(ana sayfa)")).toBe(true);
  });
});
