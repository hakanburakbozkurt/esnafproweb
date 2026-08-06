// Server-side vitrin XML import — mobil useVitrinBulkImport mantığı
import type { SupabaseClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";
import { sanitizeFeedHtmlToPlainText } from "./feed-html";
import { extractProviderTryListPrice11 } from "./provider-price";
import {
  buildXmlAutoMapping,
  mergeXmlMappings,
  type VitrinXmlMappingFieldKey,
  type XmlMapping,
} from "./vitrinXmlMappingFields";

export type { XmlMapping } from "./vitrinXmlMappingFields";

type ImportFxSnapshot = {
  currency: string;
  amount: number;
  try_amount: number;
  rate: number;
  recorded_at: string;
};

function isLensCategory(_category: string): boolean {
  return false;
}

function tryInferLensFromFreeText(_text: string): Record<string, unknown> | null {
  return null;
}

const BATCH = 20;

export type VitrinBulkRow = {
  /** Yalnızca geçerli UUID ise Supabase satır id (upsert); aksi halde external_id kullanın */
  id?: string;
  name: string;
  brand?: string | null;
  brand_name?: string | null;
  category?: string | null;
  category_path?: string | null;
  price: number;
  stock_quantity: number;
  min_order_quantity: number;
  description?: string | null;
  image_url?: string | null;
  image_urls?: string[];
  currency?: string | null;
  currency_code?: string | null;
  availability_status?: string | null;
  external_id?: string | null;
  group_id?: string | null;
  suggested_retail_price?: number | null;
  variant_detail?: string | null;
  /** DB `barcode`; upsert eşleştirmesi için */
  barcode?: string | null;
  /** hierarchy, source_details, lens — toptanci_products.metadata */
  metadata?: Record<string, unknown> | null;
  /** DB sütunları — feed eşlemesi */
  color_name?: string | null;
  /** `toptanci_products.stock_status` — PostgreSQL boolean */
  stock_status?: boolean | null;
  sub_category?: string | null;
  /** Kur / orijinal döviz — metadata ile birleştirilir */
  import_pricing?: {
    recorded_at: string;
    list_price_fx: ImportFxSnapshot | null;
    suggested_retail_fx: ImportFxSnapshot | null;
  } | null;
};

export type XmlRootCandidate = { path: string; label: string; count: number };

export type VitrinBulkImportState = {
  step: 'idle' | 'parsing' | 'rootSelect' | 'mapping' | 'uploading' | 'done';
  progress: number;
  totalRows: number;
  processedRows: number;
  addedCount: number;
  updatedCount: number;
  /** İsim / fiyat / toptanci_id vb. nedeniyle atlanan satırlar (parse veya doğrulama) */
  skippedRowCount?: number;
  /** Veritabanı hatası olan satırlar */
  failedRowCount?: number;
  error?: string;
  /** XML için: ham ürün listesi */
  xmlRawItems?: Record<string, unknown>[];
  /** XML için: tüm etiketler (recursive, nested path: skus.sku.name) */
  xmlTags?: string[];
  /** XML için: kullanıcı eşleştirmesi */
  xmlMapping?: XmlMapping;
  /** Dosya tipi: xml ise mapping adımı göster */
  fileType?: 'xml' | 'excel';
  /** XML root seçimi: ürün listesi hangi etiket altında */
  xmlRootCandidates?: XmlRootCandidate[];
  xmlSelectedRoot?: string;
  /** Parse edilmiş ham XML objesi (root seçimi için) */
  xmlParsedRoot?: Record<string, unknown>;
};

const IMPORT_SCHEMA_CACHE_MS = 45_000;
let importSchemaCacheUid = '';
let importSchemaCacheOkUntil = 0;

/** İçe aktarma öncesi: external_id + barcode kolonları PostgREST tarafından seçilebiliyor mu */
async function verifyToptanciProductsImportSchema(
  supabase: SupabaseClient,
  uid: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase
    .from('toptanci_products')
    .select('id, external_id, barcode, brand_name, color_name, stock_status, stock_quantity, sub_category, updated_at')
    .eq('toptanci_id', uid)
    .limit(1);
  if (error) {
    importSchemaCacheUid = '';
    importSchemaCacheOkUntil = 0;
    const msg = error.message || String(error);
    const lower = msg.toLowerCase();
    if (lower.includes('column') || lower.includes('does not exist') || lower.includes('schema cache')) {
      return {
        ok: false,
        message:
          'toptanci_products tablosunda içe aktarma için gerekli sütunlar (external_id, barcode) eksik veya API şeması güncel değil. Supabase’de kolonları ekleyip şema önbelleğini yenileyin. Ayrıntı: ' +
          msg,
      };
    }
    return { ok: false, message: `Şema doğrulanamadı: ${msg}` };
  }
  return { ok: true };
}

async function verifyToptanciProductsImportSchemaCached(
  supabase: SupabaseClient,
  uid: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const now = Date.now();
  if (importSchemaCacheUid === uid && now < importSchemaCacheOkUntil) return { ok: true };
  const r = await verifyToptanciProductsImportSchema(supabase, uid);
  if (r.ok) {
    importSchemaCacheUid = uid;
    importSchemaCacheOkUntil = now + IMPORT_SCHEMA_CACHE_MS;
  }
  return r;
}

/** Upsert: aynı vitrinde aynı barkod → mevcut satır id */
async function findToptanciProductIdByBarcode(
  supabase: SupabaseClient,
  uid: string,
  barcode: string | null | undefined,
): Promise<string | null> {
  const b = barcode?.trim();
  if (!b) return null;
  const { data } = await supabase
    .from('toptanci_products')
    .select('id')
    .eq('toptanci_id', uid)
    .eq('barcode', b)
    .maybeSingle();
  if (data && typeof (data as { id?: string }).id === 'string') return String((data as { id: string }).id);
  return null;
}

/** Upsert eşleştirme: SKU / dış kod (external_id) */
async function findToptanciProductIdByDedupe(
  supabase: SupabaseClient,
  uid: string,
  externalId: string | null | undefined,
): Promise<string | null> {
  const ext = externalId?.trim();
  if (!ext) return null;
  const { data } = await supabase
    .from('toptanci_products')
    .select('id')
    .eq('toptanci_id', uid)
    .eq('external_id', ext)
    .maybeSingle();
  if (data && typeof (data as { id?: string }).id === 'string') return String((data as { id: string }).id);
  return null;
}

/** Fiyat: boşluk/geçersiz karakter temizle, parseFloat. Sayısal değilse 0. */
function toPrice(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const cleaned = String(val).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Stok: parseInt ile sayıya zorla. Geçersizse 0. */
function toStock(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const cleaned = String(val).replace(/\s/g, '').replace(/[^\d-]/g, '');
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

const STOCK_STATUS_TRUTHY = /^(1|true|yes|var|evet|stokta|in\s*stock|instock|available|mevcut)$/i;
const STOCK_STATUS_FALSY =
  /^(0|false|no|hayır|yok|tükendi|out\s*of\s*stock|out_of_stock|outofstock|unavailable|nostock)$/i;

/**
 * `toptanci_products.stock_status` (boolean) için feed metin/boolean/normalize.
 * Örn. `available` → true, `out_of_stock` → false.
 */
export function normalizeStockStatusForDb(val: unknown): boolean | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'boolean') return val;
  const raw = String(val).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const underscored = lower.replace(/\s+/g, '_');
  if (lower === 'true' || lower === '1' || lower === 'yes') return true;
  if (lower === 'false' || lower === '0' || lower === 'no') return false;
  if (lower === 'available' || underscored === 'in_stock' || lower === 'instock' || lower === 'in stock')
    return true;
  if (
    underscored === 'out_of_stock' ||
    lower === 'out of stock' ||
    lower === 'outofstock' ||
    lower === 'unavailable'
  )
    return false;
  if (STOCK_STATUS_TRUTHY.test(lower)) return true;
  if (STOCK_STATUS_FALSY.test(lower)) return false;
  return null;
}

/**
 * Feed'den gelen tek alanı böl: saf sayı → stock_quantity; Var/Yok, true/false, availability metni → metin `status`.
 * Boolean kolon için sonradan `normalizeStockStatusForDb` kullanın.
 */
export function splitStockFeedValue(val: unknown): { qty: number; status: string | null } {
  if (val === null || val === undefined || val === '') return { qty: 0, status: null };
  if (typeof val === 'boolean') {
    return { qty: 0, status: val ? 'Var' : 'Yok' };
  }
  if (typeof val === 'number' && Number.isFinite(val)) {
    if (val >= 0) return { qty: Math.floor(val), status: null };
    return { qty: 0, status: null };
  }
  const s = String(val).trim();
  if (!s) return { qty: 0, status: null };

  const compact = s.replace(/\s/g, '').replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(compact)) {
    const n = parseFloat(compact);
    if (Number.isFinite(n) && n >= 0) return { qty: Math.floor(n), status: null };
  }

  const lower = s.toLowerCase();
  if (STOCK_STATUS_TRUTHY.test(lower) || STOCK_STATUS_FALSY.test(lower)) {
    return { qty: 0, status: s };
  }

  const qtyOnly = toStock(val);
  if (qtyOnly > 0) return { qty: qtyOnly, status: null };

  return { qty: 0, status: s };
}

function resolveMappedStock(
  mapping: XmlMapping,
  getVal: (path?: string) => unknown,
): { qty: number; status: string | null } {
  const explicitStatus = mapping.stock_status ? toStr(getVal(mapping.stock_status)) || null : null;
  const qPath = mapping.stock_quantity;
  const legacyPath = mapping.stock;

  let qty = 0;
  let status: string | null = explicitStatus;

  if (qPath && legacyPath && qPath === legacyPath) {
    const sp = splitStockFeedValue(getVal(qPath));
    qty = sp.qty;
    if (!status && sp.status) status = sp.status;
  } else {
    if (qPath) qty = toStock(getVal(qPath));
    if (legacyPath && legacyPath !== qPath) {
      const sp = splitStockFeedValue(getVal(legacyPath));
      if (sp.qty > 0) qty = Math.max(qty, sp.qty);
      if (!status && sp.status) status = sp.status;
    }
  }

  const availStr = mapping.availability ? toStr(getVal(mapping.availability)) || null : null;
  if (!status && availStr) status = availStr;

  return { qty, status };
}

function toNum(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  return parseFloat(String(val).replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
}

function toStr(val: unknown): string {
  return val === null || val === undefined ? '' : String(val).trim();
}

/** id: sayıysa string'e çevir */
function toId(val: unknown): string | undefined {
  const s = val === null || val === undefined ? '' : String(val).trim();
  if (!s) return undefined;
  return s;
}

function isUuidString(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());
}

/** Nested veya flatten objeden path ile değer al. UI önizleme için export. */
export function getNestedVal(obj: Record<string, unknown>, path: string): unknown {
  if (!path || !obj) return undefined;
  if (path in obj) return obj[path];
  const parts = path.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    const key = p.replace(/\[\d+\]$/, '');
    const next = (current as Record<string, unknown>)[key];
    if (Array.isArray(next) && next.length > 0) current = next[0];
    else current = next;
  }
  return current;
}

/** Sağlayıcı şeması: `prices["11"].price` (TRY) — düz veya düzleştirilmiş ürün satırında. */
function tryListPrice11FromItem(item: Record<string, unknown>): number {
  const root = item.prices;
  if (root != null && typeof root === 'object') {
    const n = extractProviderTryListPrice11(root);
    if (Number.isFinite(n) && n > 0) return n;
  }
  for (const k of ['prices.11.price', 'prices.11.Price'] as const) {
    if (k in item) {
      const v = toPrice((item as Record<string, unknown>)[k]);
      if (v > 0) return v;
    }
  }
  const nested = getNestedVal(item, 'prices.11.price');
  if (nested != null && nested !== '') {
    const v = toPrice(nested);
    if (v > 0) return v;
  }
  return 0;
}

const XML_TAG_SAMPLE_MAX_LEN = 20;
const XML_TAG_SAMPLE_SCAN_ROWS = 15;

/** Eşleştirme seçicisinde her etiket için örnek metin (ilk dolu satır, max uzunluk). */
export function computeXmlTagSampleStrings(
  flatItems: Record<string, unknown>[],
  tags: string[],
  opts?: { maxLen?: number; maxRows?: number },
): Record<string, string> {
  const maxLen = opts?.maxLen ?? XML_TAG_SAMPLE_MAX_LEN;
  const maxRows = opts?.maxRows ?? XML_TAG_SAMPLE_SCAN_ROWS;
  const out: Record<string, string> = {};
  const rowLimit = Math.min(flatItems.length, maxRows);
  for (const tag of tags) {
    let picked = '';
    for (let r = 0; r < rowLimit; r++) {
      const row = flatItems[r];
      if (!row || typeof row !== 'object') continue;
      const v = getNestedVal(row, tag);
      if (v == null || v === '') continue;
      let str: string;
      if (typeof v === 'object') {
        try {
          str = JSON.stringify(v);
        } catch {
          str = String(v);
        }
      } else {
        str = String(v);
      }
      const t = str.trim().replace(/\s+/g, ' ');
      if (t) {
        picked = t;
        break;
      }
    }
    out[tag] = picked.length > maxLen ? `${picked.slice(0, maxLen)}…` : picked;
  }
  return out;
}

/** Objeyi recursive tarayıp tüm leaf path'leri topla (skus.sku.name gibi) */
function extractTagsRecursive(obj: Record<string, unknown>, prefix = ''): string[] {
  const tags: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (!k || k.startsWith('@')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      const sub = v as Record<string, unknown>;
      if (Object.keys(sub).every((sk) => sk.startsWith('@'))) {
        tags.push(path);
      } else {
        tags.push(...extractTagsRecursive(sub, path));
      }
    } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
      tags.push(...extractTagsRecursive(v[0] as Record<string, unknown>, path));
    } else {
      tags.push(path);
    }
  }
  return tags;
}

const PRODUCT_ARRAY_HINT_RE =
  /name|title|baslik|urun|product|sku|fiyat|price|cost|barcode|barkod|stock|stok|quantity|adet|description|aciklama|detay|image|img|picture/i;

function scoreProductLikeRow(sample: Record<string, unknown>): number {
  let s = 0;
  const flatKeys = Object.keys(sample)
    .filter((k) => !k.startsWith('@'))
    .join('.')
    .toLowerCase();
  if (PRODUCT_ARRAY_HINT_RE.test(flatKeys)) s += 14;
  const nk = Object.keys(sample).filter((k) => !k.startsWith('@')).length;
  s += Math.min(nk, 28);
  return s;
}

function looksLikeProductLeaf(o: Record<string, unknown>): boolean {
  return PRODUCT_ARRAY_HINT_RE.test(Object.keys(o).join('.').toLowerCase());
}

function scoreArrayCandidate(items: Record<string, unknown>[]): number {
  if (items.length === 0) return 0;
  return items.length * 5 + scoreProductLikeRow(items[0]);
}

type ScoredObjectArray = { path: string; items: Record<string, unknown>[]; score: number };

function dedupeScoredPaths(entries: ScoredObjectArray[]): ScoredObjectArray[] {
  const byPath = new Map<string, ScoredObjectArray>();
  for (const e of entries) {
    const prev = byPath.get(e.path);
    if (!prev || e.score > prev.score) byPath.set(e.path, e);
  }
  return [...byPath.values()].sort((a, b) => b.score - a.score);
}

/**
 * Etiket adına bağlı kalmadan tüm ağacı tarar: nesne dizileri + tek ürün nesnesi (tek çocuklu XML).
 */
function findAllScoredObjectArrays(base: Record<string, unknown>): ScoredObjectArray[] {
  const found: ScoredObjectArray[] = [];

  function walk(obj: Record<string, unknown>, prefix: string) {
    for (const [k, v] of Object.entries(obj)) {
      if (!k || k.startsWith('@') || k.startsWith('?')) continue;
      const path = prefix ? `${prefix}.${k}` : k;
      if (Array.isArray(v) && v.length > 0) {
        const first = v[0];
        if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
          const items = v as Record<string, unknown>[];
          const keyCount = Object.keys(first).filter((x) => !x.startsWith('@')).length;
          if (keyCount >= 1) {
            found.push({ path, items, score: scoreArrayCandidate(items) });
          }
        }
      } else if (v != null && typeof v === 'object' && !Array.isArray(v)) {
        const o = v as Record<string, unknown>;
        const keys = Object.keys(o).filter((x) => !x.startsWith('@'));
        if (keys.length >= 2 && looksLikeProductLeaf(o)) {
          found.push({ path, items: [o], score: scoreArrayCandidate([o]) * 0.9 });
        }
        walk(o, path);
      }
    }
  }

  walk(base, '');
  return dedupeScoredPaths(found);
}

function unionTagsFromScoredCandidates(candidates: ScoredObjectArray[], maxCandidates = 10): string[] {
  const set = new Set<string>();
  let n = 0;
  for (const c of candidates) {
    if (n >= maxCandidates) break;
    n += 1;
    for (const raw of c.items.slice(0, 4)) {
      const flat = flattenProductRowForImport(raw);
      for (const key of Object.keys(flat)) {
        if (key && !key.startsWith('@')) set.add(key);
      }
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));
}

const FLATTEN_ARRAY_OBJECT_CAP = 25;

/**
 * Ürün satırını düzleştir: nested objeler + dizi içindeki tüm obje elemanlarının alanlarını birleştirir
 * (variants/specs/options altındaki renk vb. ilk satırda yoksa bile etiket listesinde ve değerde görünsün).
 */
function flattenProductRowForImport(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!k || k.startsWith('@')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      const sub = v as Record<string, unknown>;
      if (Object.keys(sub).every((sk) => sk.startsWith('@'))) {
        result[path] = v;
      } else {
        Object.assign(result, flattenProductRowForImport(sub, path));
      }
    } else if (Array.isArray(v) && v.length > 0) {
      const first = v[0];
      if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
        const limit = Math.min(v.length, FLATTEN_ARRAY_OBJECT_CAP);
        for (let i = 0; i < limit; i++) {
          const el = v[i];
          if (typeof el === 'object' && el !== null && !Array.isArray(el)) {
            Object.assign(result, flattenProductRowForImport(el as Record<string, unknown>, path));
          }
        }
      } else {
        result[path] = first;
      }
    } else {
      result[path] = v;
    }
  }
  return result;
}

/** Örnek: tek elemanlı diziler — sadece ilk objeyi kullan (geri uyumluluk) */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!k || k.startsWith('@')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      const sub = v as Record<string, unknown>;
      if (Object.keys(sub).every((sk) => sk.startsWith('@'))) {
        result[path] = v;
      } else {
        Object.assign(result, flattenObject(sub, path));
      }
    } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
      Object.assign(result, flattenObject(v[0] as Record<string, unknown>, path));
    } else {
      result[path] = v;
    }
  }
  return result;
}

/**
 * Toptancı XML'inde İSTİSNASIZ tüm sütun yolları: her ürün satırı düzleştirildikten sonra
 * anahtarların birleşimi (yalnızca ilk satıra güvenmek — örn. yalnızca 4 buton — hatalı).
 */
function unionColumnKeysFromFlatItems(flatItems: Record<string, unknown>[]): string[] {
  const set = new Set<string>();
  for (const row of flatItems) {
    if (!row || typeof row !== 'object') continue;
    for (const k of Object.keys(row)) {
      if (k && !k.startsWith('@')) set.add(k);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));
}

/** Path ile objeden items array al (path: "feed.item" veya "products.product") */
function getItemsByPath(obj: Record<string, unknown>, path: string): Record<string, unknown>[] {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return [];
    current = (current as Record<string, unknown>)[p];
  }
  if (!Array.isArray(current)) return current ? [current as Record<string, unknown>] : [];
  return current as Record<string, unknown>[];
}

/** XML parse — kök/item etiket adına bağlı değil; tüm ağaçta ürün benzeri diziler skorlanır. `parsedRoot` her zaman tam parse ağacıdır (path çözümlemesi için). */
export function parseXmlFlexible(xmlStr: string): {
  candidates: XmlRootCandidate[];
  parsedRoot: Record<string, unknown>;
  items: Record<string, unknown>[];
  tags: string[];
  selectedPath: string | null;
} {
  const parser = new XMLParser({ ignoreAttributes: false });
  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xmlStr);
  } catch (e) {
    console.log('[VitrinBulkImport] XML parse hatası:', e);
    return { candidates: [], parsedRoot: {}, items: [], tags: [], selectedPath: null };
  }

  const parsedFull = parsed;
  const scoredTrees = findAllScoredObjectArrays(parsedFull);
  const merged: ScoredObjectArray[] = [...scoredTrees];

  const rootKey = Object.keys(parsedFull).find((k) => !k.startsWith('@') && !k.startsWith('?'));
  if (rootKey) {
    const firstVal = parsedFull[rootKey];
    if (Array.isArray(firstVal) && firstVal.length > 0 && typeof firstVal[0] === 'object' && firstVal[0] !== null) {
      const arr = firstVal as Record<string, unknown>[];
      merged.push({ path: rootKey, items: arr, score: scoreArrayCandidate(arr) });
    }
  }

  const deduped = dedupeScoredPaths(merged);
  if (deduped.length === 0) {
    return { candidates: [], parsedRoot: parsedFull, items: [], tags: [], selectedPath: null };
  }

  const candidates: XmlRootCandidate[] = deduped.map((d) => ({
    path: d.path,
    label: d.path,
    count: d.items.length,
  }));

  const best = deduped[0]!;
  const multiRoot = deduped.length > 1;

  const tags = multiRoot
    ? unionTagsFromScoredCandidates(deduped)
    : unionColumnKeysFromFlatItems(best.items.map((i) => flattenProductRowForImport(i)));

  const items = multiRoot ? [] : best.items.map((i) => flattenProductRowForImport(i));

  return {
    candidates,
    parsedRoot: parsedFull,
    items,
    tags,
    selectedPath: !multiRoot && items.length > 0 ? best.path : null,
  };
}

function slugFeedPart(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_|.-]/gi, '')
    .slice(0, 80);
}

function composeFeedGroupId(collectionRaw: string | null, groupRaw: string | null): string | null {
  const c = collectionRaw?.trim() || null;
  const g = groupRaw?.trim() || null;
  if (c && g) return `grp_col:${slugFeedPart(c)}|${slugFeedPart(g)}`;
  if (c) return `grp_col:${slugFeedPart(c)}`;
  if (g) return `grp_feed:${slugFeedPart(g)}`;
  return null;
}

function extrasFromUnmappedTags(
  item: Record<string, unknown>,
  mapping: XmlMapping,
  allTags: string[] | undefined,
  maxLen = 400,
): Record<string, string> | undefined {
  if (!allTags?.length) return undefined;
  const used = new Set(
    Object.values(mapping).filter((v): v is string => typeof v === 'string' && v.length > 0),
  );
  const out: Record<string, string> = {};
  for (const tag of allTags) {
    if (used.has(tag)) continue;
    const raw = getNestedVal(item, tag);
    if (raw == null || raw === '') continue;
    const s = String(raw).trim();
    if (!s) continue;
    out[tag] = s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
  }
  return Object.keys(out).length ? out : undefined;
}

export type BuildProductsFromMappingResult = {
  rows: VitrinBulkRow[];
  skippedRowCount: number;
};

export type BuildProductsFromMappingOptions = {
  /** xmlTags — eşlenmeyen sütunlar metadata.source_details.feed_extras içine */
  allTags?: string[];
};

/**
 * Kullanıcı eşleştirmesi ile ham XML ürünlerini VitrinBulkRow'a çevir.
 * metadata.hierarchy (kategori), metadata.source_details (yan alanlar + feed_extras), group_id (koleksiyon+grup).
 */
export function buildProductsFromMapping(
  xmlItems: Record<string, unknown>[],
  mapping: XmlMapping,
  opts?: BuildProductsFromMappingOptions,
): BuildProductsFromMappingResult {
  let skippedRowCount = 0;
  const rows: VitrinBulkRow[] = [];
  const allTags = opts?.allTags;

  xmlItems.forEach((item, index) => {
    try {
      const getVal = (path?: string) => (path ? getNestedVal(item, path) : undefined);
      const name = toStr(getVal(mapping.name));
      if (!name) {
        skippedRowCount += 1;
        console.log(`[VitrinBulkImport] Satır ${index + 1}: name eşleşmesi boş, atlanıyor`);
        return;
      }
      let price = mapping.price ? toPrice(getVal(mapping.price)) : 0;
      if (!Number.isFinite(price) || price <= 0) {
        const fb = tryListPrice11FromItem(item);
        if (fb > 0) price = fb;
      }
      const curStr = mapping.currency ? toStr(getVal(mapping.currency)) || null : null;
      if (!Number.isFinite(price) || price <= 0) {
        skippedRowCount += 1;
        console.log(`[VitrinBulkImport] Satır ${index + 1}: geçersiz fiyat, atlanıyor (${name})`);
        return;
      }

      const idVal = getVal(mapping.id);
      const idRaw = idVal != null && idVal !== '' ? toId(idVal) : undefined;
      const id = idRaw && isUuidString(idRaw) ? idRaw : undefined;
      const external_id = idRaw && !isUuidString(idRaw) ? idRaw.trim() || null : null;

      const barcodeVal = mapping.barcode ? toStr(getVal(mapping.barcode)) || null : null;

      const { qty: stock, status: stockStatusResolved } = resolveMappedStock(mapping, getVal);
      const stockStatusBool = normalizeStockStatusForDb(stockStatusResolved);

      const imageVal = getVal(mapping.image_url);
      const imageUrl = imageVal != null && imageVal !== '' ? toStr(imageVal) : null;

      const categoryVal = mapping.category ? toStr(getVal(mapping.category)) || 'Genel' : 'Genel';
      const categoryPathVal = mapping.category_path ? toStr(getVal(mapping.category_path)) || null : null;
      const variantHint = mapping.variant_detail ? toStr(getVal(mapping.variant_detail)) : '';
      const descRaw = mapping.description ? toStr(getVal(mapping.description)) : '';
      const descVal = descRaw ? sanitizeFeedHtmlToPlainText(descRaw) : '';
      const lensHintText = [variantHint, descVal].filter(Boolean).join(' · ');

      const brandStr =
        (mapping.brand_name ? toStr(getVal(mapping.brand_name)) : '') ||
        (mapping.brand ? toStr(getVal(mapping.brand)) : '') ||
        null;
      const availStr = mapping.availability ? toStr(getVal(mapping.availability)) || null : null;

      const colorVal =
        (mapping.color_name ? toStr(getVal(mapping.color_name)) : '') ||
        (mapping.color ? toStr(getVal(mapping.color)) : '') ||
        null;
      const subCatVal = mapping.sub_category ? toStr(getVal(mapping.sub_category)) || null : null;
      const materialVal = mapping.material ? toStr(getVal(mapping.material)) || null : null;

      const collectionStr = mapping.collection_id ? toStr(getVal(mapping.collection_id)) || null : null;
      const groupTagStr = mapping.group_id ? toStr(getVal(mapping.group_id)) || null : null;
      const groupIdVal = composeFeedGroupId(collectionStr, groupTagStr);

      let costRaw: number | null = null;
      if (mapping.cost) {
        const c = toPrice(getVal(mapping.cost));
        if (Number.isFinite(c) && c > 0) costRaw = c;
      }

      const minOrderVal = Math.max(
        1,
        mapping.min_order_quantity ? toStock(getVal(mapping.min_order_quantity)) || 1 : 1,
      );

      let suggested_retail_price: number | null = null;
      if (mapping.suggested_retail_price) {
        const srpRaw = toPrice(getVal(mapping.suggested_retail_price));
        if (Number.isFinite(srpRaw) && srpRaw > 0) suggested_retail_price = srpRaw;
      }

      const import_pricing: VitrinBulkRow['import_pricing'] = null;

      const hierarchy: Record<string, unknown> = {};
      if (categoryVal && categoryVal !== 'Genel') hierarchy.category = categoryVal;
      if (categoryPathVal) hierarchy.path = categoryPathVal;

      const source_details: Record<string, unknown> = {
        brand: brandStr,
        brand_name: brandStr,
        barcode: barcodeVal,
        stock_quantity: stock,
        stock_status: stockStatusResolved,
        color: colorVal,
        color_name: colorVal,
        options_color_name: colorVal,
        sub_category: subCatVal,
        material: materialVal,
        description: descVal || null,
        listing_description_plain: descVal || null,
        availability: availStr ?? stockStatusResolved,
        variant_detail: variantHint || null,
        currency_original: curStr,
        min_order_quantity: minOrderVal,
        compatibility: {
          manufacturer: null,
          brand: brandStr,
          device_models_text: null,
        },
      };
      if (suggested_retail_price != null) source_details.suggested_retail_price_feed = suggested_retail_price;
      if (costRaw != null) source_details.cost = costRaw;

      const feed_extras = extrasFromUnmappedTags(item, mapping, allTags);
      if (feed_extras) source_details.feed_extras = feed_extras;

      const meta: Record<string, unknown> = { source_details };
      if (Object.keys(hierarchy).length) meta.hierarchy = hierarchy;

      let metadata: Record<string, unknown> | undefined = meta;
      if (isLensCategory(categoryVal)) {
        const lensSrc = lensHintText.trim() || name;
        const lens = tryInferLensFromFreeText(lensSrc);
        if (lens) metadata = { ...meta, lens };
      }

      rows.push({
        id,
        external_id,
        group_id: groupIdVal,
        suggested_retail_price,
        name,
        brand: brandStr,
        brand_name: brandStr,
        category: categoryVal,
        category_path: categoryPathVal,
        sub_category: subCatVal,
        color_name: colorVal,
        stock_status: stockStatusBool,
        price,
        stock_quantity: stock,
        min_order_quantity: minOrderVal,
        description: mapping.description ? descVal || null : null,
        image_url: imageUrl,
        image_urls: imageUrl ? [imageUrl] : [],
        currency: 'USD',
        currency_code: 'USD',
        barcode: barcodeVal,
        availability_status: stockStatusResolved ?? availStr,
        variant_detail: variantHint || null,
        metadata,
        import_pricing,
      });
    } catch (e) {
      skippedRowCount += 1;
      console.log(`[VitrinBulkImport] Satır ${index + 1} — hata:`, e);
    }
  });
  return { rows, skippedRowCount };
}

/** Sabit XML şemasında birden fazla görsel alanını topla */
function collectXmlProductImageUrls(p: Record<string, unknown>): string[] {
  const urls: string[] = [];
  const add = (u: unknown) => {
    const s = toStr(u);
    if (s && /^https?:\/\//i.test(s)) urls.push(s);
  };
  add(p.image ?? p.Image ?? p.image_url ?? p.ImageUrl ?? p.resim ?? p.picture ?? p.Picture);
  const extra = p.images ?? p.Images ?? p.image_list ?? p.gallery ?? p.Gallery ?? p.pictures ?? p.Pictures;
  if (Array.isArray(extra)) {
    for (const x of extra) {
      if (typeof x === 'string') add(x);
      else if (x != null && typeof x === 'object') {
        const o = x as Record<string, unknown>;
        add(o.url ?? o.src ?? o.href ?? o['#text']);
      }
    }
  } else if (extra != null && typeof extra === 'object') {
    const o = extra as Record<string, unknown>;
    const inner = o.image ?? o.url ?? o.Item;
    if (Array.isArray(inner)) {
      for (const x of inner) add(typeof x === 'string' ? x : (x as Record<string, unknown>)?.url);
    } else add(inner);
  }
  return [...new Set(urls)];
}

function xmlProductDescriptionPlain(p: Record<string, unknown>): string | null {
  const raw =
    toStr(
      p.description ??
        p.Description ??
        p.details ??
        p.Details ??
        p.detail ??
        p.content ??
        p.Content ??
        p.long_description ??
        p.LongDescription ??
        p.html_description ??
        p.aciklama,
    ) || '';
  if (!raw) return null;
  const plain = sanitizeFeedHtmlToPlainText(raw);
  return plain.length ? plain : null;
}

/**
 * XML → toptanci_products mapping (sabit, Excel/otomatik için):
 * <id> → id (sayıysa string'e çevir)
 * <name> → name
 * <brand> → brand
 * <category> → category
 * <price> → price (parseFloat, temizle)
 * <stock> → stock_quantity (parseInt, temizle)
 * <min_order_quantity> → min_order_quantity (yoksa 1)
 * <description> → description
 * <image> → image_url
 * <currency> → currency
 */
function parseXmlProducts(xmlStr: string): VitrinBulkRow[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xmlStr);
  } catch (e) {
    console.log('[VitrinBulkImport] XML parse hatası:', e);
    return [];
  }
  const rootRaw = parsed?.products ?? parsed?.Products ?? parsed?.root;
  if (rootRaw == null || typeof rootRaw !== 'object') {
    console.log('[VitrinBulkImport] XML: products/root elementi bulunamadı');
    return [];
  }
  const r = rootRaw as Record<string, unknown>;
  const itemsRaw = r.product ?? r.Product ?? r.item ?? r.Item;
  const itemList: unknown[] = Array.isArray(itemsRaw)
    ? itemsRaw
    : itemsRaw != null
      ? [itemsRaw]
      : [];

  const rows: VitrinBulkRow[] = [];
  itemList.forEach((raw, index: number) => {
    const p = raw as Record<string, unknown>;
    try {
      const name = toStr(p.name ?? p.Name ?? p.urun_adi ?? p.title);
      if (!name) {
        console.log(`[VitrinBulkImport] XML satır ${index + 1}: name alanı eksik, atlanıyor`);
        return;
      }
      const idVal = p.id ?? p.Id ?? p.product_id;
      const id = idVal != null && idVal !== '' ? toId(idVal) : undefined;

      const gallery = collectXmlProductImageUrls(p);
      const image_url = gallery[0] ?? null;
      const descPlain = xmlProductDescriptionPlain(p);
      const brandNm =
        toStr(p.brand_name ?? p.BrandName ?? p.brand ?? p.Brand ?? p.marka) || null;
      const colorNm =
        toStr(p.color_name ?? p.ColorName ?? p.color ?? p.Color ?? p.renk ?? p.colour) || null;
      const subCat = toStr(p.sub_category ?? p.SubCategory ?? p.alt_kategori ?? p.altKategori) || null;
      const qtyRaw = p.stock_quantity ?? p.StockQuantity ?? p.stock ?? p.Stock ?? p.adet ?? p.quantity;
      const statusRaw = p.stock_status ?? p.StockStatus ?? p.stok_durumu ?? p.availability ?? p.Availability;
      const spQty = splitStockFeedValue(qtyRaw);
      const spStat = splitStockFeedValue(statusRaw);
      const stock_quantity = Math.max(spQty.qty, spStat.qty);
      const stock_status_label =
        spStat.status ??
        (spQty.qty === 0 ? spQty.status : null) ??
        (statusRaw != null && statusRaw !== '' ? toStr(statusRaw) || null : null);
      const stock_status = normalizeStockStatusForDb(stock_status_label);
      let price = toPrice(p.price ?? p.Price ?? p.fiyat);
      if (!Number.isFinite(price) || price <= 0) {
        const fb = extractProviderTryListPrice11(p.prices);
        if (fb > 0) price = fb;
      }
      rows.push({
        id,
        name,
        brand: brandNm,
        brand_name: brandNm,
        category: toStr(p.category ?? p.Category ?? p.kategori) || 'Genel',
        category_path: toStr(p.category_path ?? p.CategoryPath ?? p.kategori_yolu) || null,
        sub_category: subCat,
        color_name: colorNm,
        price,
        stock_quantity,
        stock_status,
        min_order_quantity: Math.max(1, toStock(p.min_order_quantity ?? p.min_order ?? p.minOrder ?? 1)),
        description: descPlain,
        image_url,
        image_urls: gallery.length > 0 ? gallery : image_url ? [image_url] : [],
        currency: 'USD',
        currency_code: 'USD',
        barcode: toStr(p.barcode ?? p.Barcode ?? p.barkod ?? p.ean ?? p.gtin) || null,
        availability_status: stock_status_label,
        external_id:
          toStr(p.product_code ?? p.productCode ?? p.sku ?? p.SKU ?? p.external_id ?? p.ExternalId).trim() || null,
        metadata: {
          source_details: {
            listing_description_plain: descPlain,
            brand_name: brandNm,
            color_name: colorNm,
            options_color_name: colorNm,
            stock_status,
            stock_quantity,
            sub_category: subCat,
            material: toStr(p.material ?? p.Malzeme ?? p.malzeme) || null,
            compatibility: {
              manufacturer: toStr(p.manufacturer ?? p.Manufacturer) || null,
              brand: brandNm,
              device_models_text: toStr(p.compatible_models ?? p.devices ?? p.device) || null,
            },
          },
        },
      });
    } catch (e) {
      const prodId = p?.id ?? p?.Id ?? '?';
      console.log(`[VitrinBulkImport] XML satır ${index + 1} — ID: ${prodId}, ürün: ${String(p?.name ?? p?.Name ?? '?')} — hata:`, e);
    }
  });
  return rows;
}


export type VitrinImportStats = {
  added: number;
  updated: number;
  skipped: number;
  failed: number;
  totalParsed: number;
};

function resolveAutoXmlImportItems(parseResult: ReturnType<typeof parseXmlFlexible>): {
  items: Record<string, unknown>[];
  tags: string[];
} {
  if (parseResult.items.length > 0) {
    return { items: parseResult.items, tags: parseResult.tags };
  }
  const bestPath = parseResult.candidates[0]?.path;
  if (!bestPath) return { items: [], tags: [] };
  const rawItems = getItemsByPath(parseResult.parsedRoot, bestPath);
  const items = rawItems.map((item) => flattenProductRowForImport(item));
  return { items, tags: unionColumnKeysFromFlatItems(items) };
}

export async function uploadVitrinProducts(
  supabase: SupabaseClient,
  uid: string,
  rows: VitrinBulkRow[],
  opts?: { parseSkipped?: number },
): Promise<
  { ok: true; stats: VitrinImportStats } | { ok: false; message: string; stats: VitrinImportStats }
> {
  const emptyStats: VitrinImportStats = {
    added: 0,
    updated: 0,
    skipped: opts?.parseSkipped ?? 0,
    failed: 0,
    totalParsed: rows.length,
  };

  if (rows.length === 0) {
    return { ok: false, message: "İçe aktarılacak ürün bulunamadı.", stats: emptyStats };
  }

  const schema = await verifyToptanciProductsImportSchemaCached(supabase, uid);
  if (!schema.ok) {
    return { ok: false, message: schema.message, stats: emptyStats };
  }

  let added = 0;
  let updated = 0;
  let skippedRowCount = opts?.parseSkipped ?? 0;
  let failedRowCount = 0;

  const buildMeta = (r: VitrinBulkRow): Record<string, unknown> | undefined => {
    const base = r.metadata && typeof r.metadata === "object" ? { ...r.metadata } : {};
    if (r.import_pricing) base.import_pricing = r.import_pricing;
    return Object.keys(base).length > 0 ? base : undefined;
  };

  const buildBasePayload = (r: VitrinBulkRow): Record<string, unknown> => {
    const imgList =
      Array.isArray(r.image_urls) && r.image_urls.length > 0
        ? r.image_urls.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : r.image_url
          ? [r.image_url]
          : [];
    const meta = buildMeta(r);
    return {
      toptanci_id: uid,
      name: r.name,
      status: "normal",
      brand: r.brand ?? r.brand_name ?? null,
      brand_name: r.brand_name ?? r.brand ?? null,
      variant_detail: r.variant_detail ?? null,
      category: r.category ?? "Genel",
      category_path: r.category_path ?? null,
      sub_category: r.sub_category ?? null,
      color_name: r.color_name ?? null,
      stock_status: r.stock_status ?? null,
      price: r.price ?? 0,
      stock_quantity: r.stock_quantity ?? 0,
      min_order_quantity: r.min_order_quantity ?? 1,
      description: r.description ?? null,
      image_url: imgList[0] ?? r.image_url ?? null,
      image_urls: imgList,
      currency: r.currency ?? "USD",
      currency_code: r.currency_code ?? "USD",
      barcode: r.barcode?.trim() || null,
      availability_status: r.availability_status ?? null,
      external_id: r.external_id?.trim() || null,
      group_id: r.group_id?.trim() || null,
      suggested_retail_price:
        r.suggested_retail_price != null && Number.isFinite(r.suggested_retail_price)
          ? r.suggested_retail_price
          : null,
      updated_at: new Date().toISOString(),
      ...(meta ? { metadata: meta } : {}),
    };
  };

  const feedUpdateFields = (full: Record<string, unknown>): Record<string, unknown> => ({
    name: full.name,
    status: "normal",
    price: full.price,
    stock_quantity: full.stock_quantity,
    stock_status: full.stock_status,
    description: full.description,
    image_url: full.image_url,
    image_urls: full.image_urls,
    category: full.category,
    category_path: full.category_path,
    sub_category: full.sub_category,
    color_name: full.color_name,
    brand: full.brand,
    brand_name: full.brand_name,
    variant_detail: full.variant_detail,
    currency: full.currency,
    currency_code: full.currency_code,
    barcode: full.barcode,
    availability_status: full.availability_status,
    external_id: full.external_id,
    group_id: full.group_id,
    suggested_retail_price: full.suggested_retail_price,
    min_order_quantity: full.min_order_quantity,
    updated_at: full.updated_at,
    ...(full.metadata !== undefined ? { metadata: full.metadata } : {}),
  });

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    for (const r of batch) {
      try {
        if (!r.name?.trim() || !Number.isFinite(r.price) || r.price <= 0) {
          skippedRowCount += 1;
          continue;
        }
        const fullPayload = buildBasePayload(r);

        if (r.id) {
          const { data: existing } = await supabase
            .from("toptanci_products")
            .select("id")
            .eq("id", r.id)
            .eq("toptanci_id", uid)
            .maybeSingle();

          if (existing) {
            const { error } = await supabase
              .from("toptanci_products")
              .update(feedUpdateFields(fullPayload))
              .eq("id", r.id);
            if (error) failedRowCount += 1;
            else updated += 1;
          } else {
            const { error } = await supabase
              .from("toptanci_products")
              .insert([{ ...fullPayload, id: r.id }]);
            if (error) failedRowCount += 1;
            else added += 1;
          }
          continue;
        }

        const barcodeDedupeId = await findToptanciProductIdByBarcode(supabase, uid, r.barcode);
        if (barcodeDedupeId) {
          const { error } = await supabase
            .from("toptanci_products")
            .update(feedUpdateFields(fullPayload))
            .eq("id", barcodeDedupeId);
          if (error) failedRowCount += 1;
          else updated += 1;
          continue;
        }

        const dedupeId = await findToptanciProductIdByDedupe(supabase, uid, r.external_id);
        if (dedupeId) {
          const { error } = await supabase
            .from("toptanci_products")
            .update(feedUpdateFields(fullPayload))
            .eq("id", dedupeId);
          if (error) failedRowCount += 1;
          else updated += 1;
          continue;
        }

        const { error } = await supabase.from("toptanci_products").insert([fullPayload]);
        if (error) failedRowCount += 1;
        else added += 1;
      } catch {
        failedRowCount += 1;
      }
    }
  }

  const stats: VitrinImportStats = {
    added,
    updated,
    skipped: skippedRowCount,
    failed: failedRowCount,
    totalParsed: rows.length,
  };

  if (added === 0 && updated === 0) {
    return {
      ok: false,
      message:
        stats.skipped + stats.failed > 0
          ? "XML okundu ancak geçerli ürün satırı vitrine aktarılamadı. Alan eşlemesini veya fiyat/stok alanlarını kontrol edin."
          : "XML'de vitrine aktarılacak ürün bulunamadı.",
      stats,
    };
  }

  return { ok: true, stats };
}

export async function importVitrinFromXmlContent(
  supabase: SupabaseClient,
  uid: string,
  xmlStr: string,
  mappingOverride?: XmlMapping | null,
): Promise<
  { ok: true; stats: VitrinImportStats } | { ok: false; message: string; stats?: VitrinImportStats }
> {
  const parsed = parseXmlFlexible(xmlStr);
  const { items, tags } = resolveAutoXmlImportItems(parsed);

  if (items.length === 0) {
    return { ok: false, message: "XML dosyasında ürün listesi bulunamadı." };
  }

  const autoMapping = buildXmlAutoMapping(tags, { flatItems: items, getNestedVal });
  const mapping = mergeXmlMappings(autoMapping, mappingOverride);
  const { rows, skippedRowCount } = buildProductsFromMapping(items, mapping, { allTags: tags });

  return uploadVitrinProducts(supabase, uid, rows, { parseSkipped: skippedRowCount });
}

export { buildXmlAutoMapping, mergeXmlMappings };
