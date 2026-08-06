import type { SupabaseClient } from "@supabase/supabase-js";
import {
  importVitrinFromXmlContent,
  uploadVitrinProducts,
  type VitrinBulkRow,
  type VitrinImportStats,
} from "@/lib/toptanci/vitrin-import/bulk-import-core";
import type { XmlMapping } from "@/lib/toptanci/vitrin-import/vitrinXmlMappingFields";
import { expandProviderStyleJsonToFeedRows } from "@/lib/toptanci/vitrin-import/providerFeedNormalize";
import {
  sanitizeStoredFeedMapping,
  type FeedMappingRecord,
} from "@/lib/toptanci/feed-mapping";

export type { VitrinImportStats, FeedMappingRecord };

export type VitrinFeedImportResult =
  | { ok: true; stats: VitrinImportStats }
  | { ok: false; message: string; stats?: VitrinImportStats };

function looksLikeJsonFeed(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

export async function loadUserFeedMapping(
  supabase: SupabaseClient,
  userId: string
): Promise<FeedMappingRecord | null> {
  const { data } = await supabase
    .from("user_profiles")
    .select("feed_mapping")
    .eq("id", userId)
    .maybeSingle();
  return sanitizeStoredFeedMapping(data?.feed_mapping);
}

export async function saveUserFeedMapping(
  supabase: SupabaseClient,
  userId: string,
  mapping: FeedMappingRecord
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ feed_mapping: mapping })
    .eq("id", userId);
  if (error) return { error: error.message };
  return {};
}

/** Mobil vitrin ile aynı: feed URL profilde saklanır. */
export async function syncUserProfileXmlUrl(
  supabase: SupabaseClient,
  userId: string,
  xmlUrl: string
): Promise<void> {
  await supabase.from("user_profiles").update({ xml_url: xmlUrl }).eq("id", userId);
}

export async function markWholesalerXmlSynced(
  supabase: SupabaseClient,
  userId: string,
  xmlUrl: string
): Promise<void> {
  await supabase
    .from("wholesaler_xmls")
    .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("xml_url", xmlUrl);
}

function isPrivateOrBlockedIpv4(hostname: string): boolean {
  const parts = hostname.split(".");
  if (parts.length !== 4) {
    return false;
  }

  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [a, b] = octets;

  if (a === 127 || a === 0 || a === 10) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  return false;
}

function isBlockedFeedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  if (host === "localhost" || host === "0.0.0.0" || host === "::1") {
    return true;
  }

  if (host.endsWith(".local") || host.endsWith(".localhost")) {
    return true;
  }

  return isPrivateOrBlockedIpv4(host);
}

function assertSafeFeedFetchUrl(rawUrl: string): URL {
  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Geçersiz feed URL adresi.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Feed URL yalnızca http:// veya https:// ile başlayabilir.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Feed URL kullanıcı adı veya şifre içeremez.");
  }

  if (isBlockedFeedHostname(parsed.hostname)) {
    throw new Error("Feed URL dahili veya yerel ağ adreslerine işaret edemez.");
  }

  return parsed;
}

export async function fetchFeedTextFromUrl(url: string): Promise<string> {
  const safeUrl = assertSafeFeedFetchUrl(url);

  const res = await fetch(safeUrl.toString(), {
    headers: { Accept: "application/json, application/xml, text/xml, text/plain, */*" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Feed indirilemedi (HTTP ${res.status}).`);
  }
  const text = await res.text();
  if (!text.trim()) {
    throw new Error("Feed dosyası boş.");
  }
  return text;
}

export async function importVitrinFromJsonContent(
  supabase: SupabaseClient,
  userId: string,
  jsonStr: string
): Promise<VitrinFeedImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { ok: false, message: "Geçersiz JSON dosyası." };
  }

  const rows = expandProviderStyleJsonToFeedRows(parsed) as VitrinBulkRow[];
  if (rows.length === 0) {
    return {
      ok: false,
      message:
        "JSON içinde geçerli ürün bulunamadı. Sağlayıcı şeması: name, prices.11.price, sku, collection…",
    };
  }

  return uploadVitrinProducts(supabase, userId, rows);
}

export async function importVitrinFromFeedText(
  supabase: SupabaseClient,
  userId: string,
  feedText: string,
  mappingOverride?: XmlMapping | null
): Promise<VitrinFeedImportResult> {
  if (looksLikeJsonFeed(feedText)) {
    return importVitrinFromJsonContent(supabase, userId, feedText);
  }
  return importVitrinFromXmlContent(supabase, userId, feedText, mappingOverride);
}

async function finalizeSuccessfulImport(
  supabase: SupabaseClient,
  userId: string,
  feedUrl: string,
  result: VitrinFeedImportResult
): Promise<VitrinFeedImportResult> {
  if (result.ok) {
    await syncUserProfileXmlUrl(supabase, userId, feedUrl);
    await markWholesalerXmlSynced(supabase, userId, feedUrl);
  }
  return result;
}

export async function importVitrinFeedFromUrl(
  supabase: SupabaseClient,
  userId: string,
  feedUrl: string,
  mappingOverride?: XmlMapping | null
): Promise<VitrinFeedImportResult> {
  let feedText: string;
  try {
    feedText = await fetchFeedTextFromUrl(feedUrl);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Feed indirilemedi.",
    };
  }

  const savedMapping = mappingOverride ?? (await loadUserFeedMapping(supabase, userId));
  const result = await importVitrinFromFeedText(
    supabase,
    userId,
    feedText,
    savedMapping
  );
  return finalizeSuccessfulImport(supabase, userId, feedUrl, result);
}

export async function importVitrinFeedFromFile(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  publicUrl: string,
  mappingOverride?: XmlMapping | null
): Promise<VitrinFeedImportResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    await syncUserProfileXmlUrl(supabase, userId, publicUrl);
    return {
      ok: false,
      message:
        "Dosya yüklendi. Excel/CSV içe aktarma web'de henüz desteklenmiyor; JSON/XML yükleyin veya mobil vitrin panelini kullanın.",
    };
  }

  if (ext !== "xml" && ext !== "json") {
    return {
      ok: false,
      message: "Desteklenen formatlar: XML ve JSON (Azunlar/sağlayıcı feed).",
    };
  }

  const savedMapping = mappingOverride ?? (await loadUserFeedMapping(supabase, userId));
  const feedText = await file.text();
  const result = await importVitrinFromFeedText(
    supabase,
    userId,
    feedText,
    savedMapping
  );
  return finalizeSuccessfulImport(supabase, userId, publicUrl, result);
}

export async function reimportVitrinFeedFromStoredUrl(
  supabase: SupabaseClient,
  userId: string,
  feedUrl: string,
  mappingOverride?: XmlMapping | null
): Promise<VitrinFeedImportResult> {
  return importVitrinFeedFromUrl(supabase, userId, feedUrl, mappingOverride);
}

export async function runFeedImportWithSavedMapping(
  supabase: SupabaseClient,
  userId: string,
  feedUrl: string,
  mapping: FeedMappingRecord
): Promise<VitrinFeedImportResult> {
  await saveUserFeedMapping(supabase, userId, mapping);
  return importVitrinFeedFromUrl(supabase, userId, feedUrl, mapping);
}
