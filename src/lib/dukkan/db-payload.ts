import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParsedDukkanForm, ParsedUrun } from "@/lib/dukkan/form-data";
import { SLUG_TAKEN_ERROR } from "@/lib/dukkan/slug-availability";
import type { Database } from "@/types/database.types";

export type DukkanDbPayload = {
  dukkan_adi: string;
  slug: string;
  telefon: string | null;
  whatsapp: string | null;
  calisma_saatleri: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  adres: string | null;
  enlem: number | null;
  boylam: number | null;
  aciklama: string | null;
  meta_title: string | null;
  meta_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  dukkan_fotograflari: string[];
  sss: ParsedDukkanForm["sss"];
  iletisim_sss_goster: boolean;
  teknik_servis_aktif: boolean;
  katalog_modu_aktif: boolean;
  teknik_servis_fotograf_1: string | null;
  teknik_servis_fotograf_2: string | null;
  teknik_servis_fotograf_3: string | null;
  teknik_servis_aciklama: string | null;
  teknik_servis_sss: ParsedDukkanForm["teknik_servis_sss"];
  hakkimizda_sss: ParsedDukkanForm["hakkimizda_sss"];
  anasayfa_sss: ParsedDukkanForm["anasayfa_sss"];
  terms_accepted_at: string;
};

/** Temel vitrin alanları — migration uygulanmamış ortamlarda bile güncellenebilir olmalı */
export const DUKKAN_CORE_PAYLOAD_KEYS = [
  "dukkan_adi",
  "slug",
  "telefon",
  "adres",
  "aciklama",
  "logo_url",
  "banner_url",
  "dukkan_fotograflari",
] as const satisfies readonly (keyof DukkanDbPayload)[];

/** Migration ile eklenen isteğe bağlı alanlar */
export const DUKKAN_OPTIONAL_PAYLOAD_KEYS = [
  "whatsapp",
  "calisma_saatleri",
  "instagram_url",
  "tiktok_url",
  "facebook_url",
  "enlem",
  "boylam",
  "sss",
  "iletisim_sss_goster",
  "teknik_servis_aktif",
  "katalog_modu_aktif",
  "teknik_servis_fotograf_1",
  "teknik_servis_fotograf_2",
  "teknik_servis_fotograf_3",
  "teknik_servis_aciklama",
  "teknik_servis_sss",
  "hakkimizda_sss",
  "anasayfa_sss",
  "meta_title",
  "meta_description",
  "terms_accepted_at",
] as const satisfies readonly (keyof DukkanDbPayload)[];

export const DUKKAN_URUN_OPTIONAL_KEYS = [
  "urun_aciklama",
  "fotograf_url_2",
  "fotograf_url_3",
  "gorsel_orani",
] as const;

type DukkanRow = Database["public"]["Tables"]["dukkanlar"]["Row"];
type DukkanUpdate = Database["public"]["Tables"]["dukkanlar"]["Update"];
type DukkanInsert = Database["public"]["Tables"]["dukkanlar"]["Insert"];
type SupabaseDbClient = SupabaseClient<Database>;

export type SafeWriteResult<T> =
  | { data: T; skippedColumns: string[]; warning?: string }
  | { error: string; code?: string; skippedColumns?: string[] };

export function toDukkanDbPayload(
  data: Omit<ParsedDukkanForm, "urunler">
): DukkanDbPayload {
  return {
    dukkan_adi: data.dukkan_adi,
    slug: data.slug,
    telefon: data.telefon,
    whatsapp: data.whatsapp,
    calisma_saatleri: data.calisma_saatleri,
    instagram_url: data.instagram_url,
    tiktok_url: data.tiktok_url,
    facebook_url: data.facebook_url,
    adres: data.adres,
    enlem: data.enlem,
    boylam: data.boylam,
    aciklama: data.aciklama,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    logo_url: data.logo_url,
    banner_url: data.banner_url,
    dukkan_fotograflari: data.dukkan_fotograflari,
    sss: data.sss,
    iletisim_sss_goster: data.iletisim_sss_goster,
    teknik_servis_aktif: data.teknik_servis_aktif,
    katalog_modu_aktif: data.katalog_modu_aktif,
    teknik_servis_fotograf_1: data.teknik_servis_fotograf_1,
    teknik_servis_fotograf_2: data.teknik_servis_fotograf_2,
    teknik_servis_fotograf_3: data.teknik_servis_fotograf_3,
    teknik_servis_aciklama: data.teknik_servis_aciklama,
    teknik_servis_sss: data.teknik_servis_sss,
    hakkimizda_sss: data.hakkimizda_sss,
    anasayfa_sss: data.anasayfa_sss,
    terms_accepted_at: new Date().toISOString(),
  };
}

export function extractMissingSchemaColumn(message: string): string | null {
  const patterns = [
    /Could not find the '([^']+)' column/i,
    /column ["']?([^"'\s]+)["']? of relation ["']?dukkanlar["']? does not exist/i,
    /column ["']?([^"'\s]+)["']? of relation ["']?dukkan_urunleri["']? does not exist/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function isMissingColumnError(error: { code?: string; message?: string }): boolean {
  if (error.code === "PGRST204") return true;
  if (!error.message) return false;
  return extractMissingSchemaColumn(error.message) !== null;
}

function omitPayloadKey<T extends Record<string, unknown>>(
  payload: T,
  key: string
): T {
  const next = { ...payload };
  delete next[key];
  return next;
}

function buildSkippedColumnsWarning(skippedColumns: string[]): string | undefined {
  if (!skippedColumns.length) return undefined;

  const unique = [...new Set(skippedColumns)];
  return `Temel bilgiler kaydedildi; şu alanlar veritabanında henüz yok: ${unique.join(", ")}. Supabase migration dosyalarını uygulayın.`;
}

export async function safeUpdateDukkan(
  supabase: SupabaseDbClient,
  params: {
    dukkanId: string;
    userId: string;
    payload: DukkanDbPayload;
  }
): Promise<SafeWriteResult<Pick<DukkanRow, "id" | "slug">>> {
  let payload: Record<string, unknown> = { ...params.payload };
  const skippedColumns: string[] = [];
  const maxAttempts = DUKKAN_OPTIONAL_PAYLOAD_KEYS.length + 2;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data, error } = await supabase
      .from("dukkanlar")
      .update(payload as DukkanUpdate)
      .eq("id", params.dukkanId)
      .eq("user_id", params.userId)
      .select("id, slug")
      .single();

    if (!error) {
      const storeSync = await syncStoreMirror(supabase, {
        dukkanId: data.id,
        ownerId: params.userId,
        slug: data.slug,
        name: params.payload.dukkan_adi,
      });

      if ("error" in storeSync) {
        return {
          error: storeSync.error,
          code: storeSync.code,
          skippedColumns,
        };
      }

      return {
        data,
        skippedColumns,
        warning: buildSkippedColumnsWarning(skippedColumns),
      };
    }

    if (error.code === "23505") {
      return { error: SLUG_TAKEN_ERROR, code: error.code };
    }

    const missingColumn = extractMissingSchemaColumn(error.message ?? "");
    if (missingColumn && missingColumn in payload) {
      skippedColumns.push(missingColumn);
      payload = omitPayloadKey(payload, missingColumn);
      continue;
    }

    return {
      error: mapDukkanWriteError(error),
      code: error.code,
      skippedColumns,
    };
  }

  return {
    error: "Mağaza güncellenemedi: şema uyumsuzluğu devam ediyor.",
    skippedColumns,
  };
}

export async function safeInsertDukkan(
  supabase: SupabaseDbClient,
  params: {
    userId: string;
    payload: DukkanDbPayload;
  }
): Promise<SafeWriteResult<Pick<DukkanRow, "id" | "slug">>> {
  let payload: Record<string, unknown> = {
    user_id: params.userId,
    aktif: true,
    ...params.payload,
  };
  const skippedColumns: string[] = [];
  const maxAttempts = DUKKAN_OPTIONAL_PAYLOAD_KEYS.length + 2;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data, error } = await supabase
      .from("dukkanlar")
      .insert(payload as DukkanInsert)
      .select("id, slug")
      .single();

    if (!error) {
      const storeSync = await syncStoreMirror(supabase, {
        dukkanId: data.id,
        ownerId: params.userId,
        slug: data.slug,
        name: params.payload.dukkan_adi,
      });

      if ("error" in storeSync) {
        return {
          error: storeSync.error,
          code: storeSync.code,
          skippedColumns,
        };
      }

      return {
        data,
        skippedColumns,
        warning: buildSkippedColumnsWarning(skippedColumns),
      };
    }

    if (error.code === "23505") {
      return { error: SLUG_TAKEN_ERROR, code: error.code };
    }

    const missingColumn = extractMissingSchemaColumn(error.message ?? "");
    if (missingColumn && missingColumn in payload) {
      skippedColumns.push(missingColumn);
      payload = omitPayloadKey(payload, missingColumn);
      continue;
    }

    return {
      error: mapDukkanWriteError(error),
      code: error.code,
      skippedColumns,
    };
  }

  return {
    error: "Mağaza oluşturulamadı: şema uyumsuzluğu devam ediyor.",
    skippedColumns,
  };
}

function buildUrunRows(dukkanId: string, urunler: ParsedUrun[]) {
  return urunler.map((urun, index) => ({
    dukkan_id: dukkanId,
    urun_adi: urun.urun_adi,
    urun_aciklama: urun.urun_aciklama,
    fotograf_url: urun.fotograf_url,
    fotograf_url_2: urun.fotograf_url_2,
    fotograf_url_3: urun.fotograf_url_3,
    gorsel_orani: urun.gorsel_orani,
    sira: index,
    aktif: true,
  }));
}

export async function safeSyncDukkanUrunleri(
  supabase: SupabaseDbClient,
  dukkanId: string,
  urunler: ParsedUrun[]
): Promise<SafeWriteResult<{ synced: true }>> {
  const { error: deleteError } = await supabase
    .from("dukkan_urunleri")
    .delete()
    .eq("dukkan_id", dukkanId);

  if (deleteError) {
    return { error: deleteError.message, code: deleteError.code };
  }

  if (!urunler.length) {
    return { data: { synced: true }, skippedColumns: [] };
  }

  let rows: Record<string, unknown>[] = buildUrunRows(dukkanId, urunler);
  const skippedColumns: string[] = [];
  const maxAttempts = DUKKAN_URUN_OPTIONAL_KEYS.length + 2;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { error: insertError } = await supabase
      .from("dukkan_urunleri")
      .insert(rows as Database["public"]["Tables"]["dukkan_urunleri"]["Insert"][]);

    if (!insertError) {
      return {
        data: { synced: true },
        skippedColumns,
        warning: buildSkippedColumnsWarning(skippedColumns),
      };
    }

    const missingColumn = extractMissingSchemaColumn(insertError.message ?? "");
    if (missingColumn && rows.some((row) => missingColumn in row)) {
      skippedColumns.push(missingColumn);
      rows = rows.map((row) => omitPayloadKey(row, missingColumn));
      continue;
    }

    return {
      error: insertError.message,
      code: insertError.code,
      skippedColumns,
    };
  }

  return {
    error: "Ürünler kaydedilemedi: şema uyumsuzluğu devam ediyor.",
    skippedColumns,
  };
}

export function mergeWarnings(...warnings: Array<string | undefined>): string | undefined {
  const parts = warnings.filter(Boolean) as string[];
  if (!parts.length) return undefined;
  return parts.join(" ");
}

function mapDukkanWriteError(error: { code?: string; message?: string }): string {
  if (error.code === "42501" && error.message?.includes("stores")) {
    return "Mağaza servis kaydı oluşturulamadı: yetki politikası engelledi. Oturumunuzun açık olduğundan emin olun.";
  }

  if (error.code === "23503" && error.message?.includes("stores_owner_id_fkey")) {
    return "Mağaza kaydı oluşturulamadı: oturum kullanıcısı stores.owner_id ile eşleşmiyor. Lütfen tekrar giriş yapın veya destek ile iletişime geçin.";
  }

  return error.message ?? "Beklenmeyen bir veritabanı hatası oluştu.";
}

export async function syncStoreMirror(
  supabase: SupabaseDbClient,
  params: {
    dukkanId: string;
    ownerId: string;
    slug: string;
    name: string;
  }
): Promise<SafeWriteResult<{ synced: true }>> {
  const { error } = await supabase.from("stores").upsert(
    {
      id: params.dukkanId,
      owner_id: params.ownerId,
      slug: params.slug,
      name: params.name,
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: mapDukkanWriteError(error), code: error.code };
  }

  return { data: { synced: true }, skippedColumns: [] };
}
