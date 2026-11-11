import { describe, expect, it } from "vitest";
import { safeSyncDukkanUrunleri } from "@/lib/dukkan/db-payload";
import type { ParsedUrun } from "@/lib/dukkan/form-data";

type InsertCall = Record<string, unknown>[];

/** delete().eq() ve insert() çağrılarını kaydeden sahte Supabase istemcisi. */
function fakeClient(insertErrors: Array<{ message: string; code?: string } | null> = []) {
  const inserts: InsertCall[] = [];
  let insertIndex = 0;
  const client = {
    from() {
      return {
        delete() {
          return { eq: async () => ({ error: null }) };
        },
        insert: async (rows: InsertCall) => {
          inserts.push(rows);
          const error = insertErrors[insertIndex] ?? null;
          insertIndex += 1;
          return { error };
        },
      };
    },
  };
  return { client: client as never, inserts };
}

function urun(overrides: Partial<ParsedUrun> = {}): ParsedUrun {
  return {
    urun_adi: "Kılıf",
    urun_aciklama: null,
    fotograf_url: "a.webp",
    fotograf_url_2: null,
    fotograf_url_3: null,
    fotograf_url_4: null,
    fotograf_url_5: null,
    fotograf_url_6: null,
    fotograf_url_7: null,
    fotograf_url_8: null,
    urun_kategorisi: null,
    fiyat: null,
    stok_adedi: null,
    barkod: null,
    product_id: null,
    gorsel_orani: "yatay",
    ...overrides,
  };
}

const PRODUCT_ID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("safeSyncDukkanUrunleri — uygulama stok bağlantısı", () => {
  it("bağlı ürünün product_id'sini yeniden yazar (sil-yeniden-ekle kaydında kopmaz)", async () => {
    const { client, inserts } = fakeClient();
    const result = await safeSyncDukkanUrunleri(client, "dukkan-1", [
      urun({ product_id: PRODUCT_ID }),
      urun({ urun_adi: "Cam" }),
    ]);

    expect(result).toMatchObject({ data: { synced: true } });
    expect(inserts).toHaveLength(1);
    expect(inserts[0][0].product_id).toBe(PRODUCT_ID);
    // Bağlantısız satırda alan hiç gönderilmez.
    expect("product_id" in inserts[0][1]).toBe(false);
  });

  it("bağlantısız ürünlerde product_id göndermez (migration öncesi şema uyarısı çıkmaz)", async () => {
    const { client, inserts } = fakeClient();
    const result = await safeSyncDukkanUrunleri(client, "dukkan-1", [urun(), urun()]);

    expect(result).toMatchObject({ data: { synced: true }, skippedColumns: [] });
    expect(inserts[0].every((row) => !("product_id" in row))).toBe(true);
  });

  it("sütun henüz yoksa product_id'yi düşürüp yeniden dener", async () => {
    const { client, inserts } = fakeClient([
      { message: "Could not find the 'product_id' column of 'dukkan_urunleri' in the schema cache", code: "PGRST204" },
      null,
    ]);
    const result = await safeSyncDukkanUrunleri(client, "dukkan-1", [urun({ product_id: PRODUCT_ID })]);

    expect(result).toMatchObject({ data: { synced: true }, skippedColumns: ["product_id"] });
    expect(inserts).toHaveLength(2);
    expect("product_id" in inserts[1][0]).toBe(false);
  });
});
