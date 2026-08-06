/**
 * B2B / sağlayıcı JSON beslemesi → vitrin import satırları.
 * - TRY fiyat: yalnızca prices["11"].price (diğer fiyat tipleri yok sayılır)
 * - external_id: sku
 * - Renk / barkod: metadata.source_details (options[0].name, barcode)
 * - group_id: collection.id veya collection.name + brand.name
 * - Açıklama: description/content/hits öncelikli, yoksa manufacturer+brand+devices+collection+categories şablonu
 * - metadata.source_details (+ hierarchy.category): marka, cihaz, şablon alanları
 * - Görseller: `images[]` tamamı → `image_urls` (PostgreSQL dizi); URL’de thumb/small → large/original
 *
 * Çıktı `useVitrinBulkImport` / VitrinBulkRow ile uyumludur.
 */

import {
  extractPriorityFeedDescriptionFromRaw,
  providerSourceDetailsDescriptionFields,
  resolveProviderListingDescription,
  sanitizeFeedHtmlToPlainText,
} from "./providerProductDescription";

type ImportFxSnapshot = {
  currency: string;
  amount: number;
  try_amount: number;
  rate: number;
  recorded_at: string;
};

export type ProviderVitrinImportRow = {
  name: string;
  external_id: string | null;
  group_id: string | null;
  brand: string | null;
  brand_name: string | null;
  category: string | null;
  price: number;
  stock_quantity: number;
  min_order_quantity: number;
  description: string | null;
  image_url: string | null;
  /** DB `image_urls` — tüm galeri (images kolonu yok, dizi burada) */
  image_urls: string[];
  /** Tavsiye perakende (TRY), varsa vitrinde üstü çizili */
  suggested_retail_price?: number | null;
  currency: string | null;
  currency_code: string | null;
  variant_detail: string | null;
  metadata: Record<string, unknown>;
  import_pricing: {
    recorded_at: string;
    list_price_fx: ImportFxSnapshot | null;
    suggested_retail_fx: ImportFxSnapshot | null;
  } | null;
};

/** @deprecated İçe aktarmada kur kullanılmıyor; geriye dönük imza için boş bırakılabilir */
export type ProviderFeedExpandOptions = {
  tryPerUsd?: number;
};

function toNum(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function toStr(v: unknown): string {
  return v === null || v === undefined ? '' : String(v).trim();
}

/** Besleme: liste fiyatı TRY — fiyat tipi 11 */
export function extractProviderTryListPrice11(prices: unknown): number {
  if (prices == null || typeof prices !== 'object') return 0;
  const p = prices as Record<string, unknown>;
  const block = p['11'] ?? p[String(11)];
  if (block == null || typeof block !== 'object') return 0;
  return toNum((block as Record<string, unknown>).price);
}

export function upgradeFeedThumbToLargeUrl(rawUrl: string): string {
  let u = rawUrl.trim();
  if (!u) return u;
  const rules: [RegExp, string][] = [
    [/\bthumb\b/gi, 'large'],
    [/\bthumbnail\b/gi, 'original'],
    [/_thumb\b/gi, '_large'],
    [/-thumb\b/gi, '-large'],
    [/\/small\//gi, '/large/'],
    [/\bsmall\b/gi, 'large'],
    [/\/mini\//gi, '/large/'],
    [/\/t\//g, '/o/'],
  ];
  for (const [re, rep] of rules) {
    if (re.test(u)) u = u.replace(re, rep);
  }
  if (/\b(thumb|small|thumbnail|mini)\b/i.test(u)) {
    u = u.replace(/\bthumb\b/gi, 'original').replace(/\bsmall\b/gi, 'original').replace(/\bmini\b/gi, 'original');
  }
  return u;
}

/**
 * Beslemedeki `images` dizisinin tamamı — string veya { url, thumb, … }.
 * Kalite: thumb/small → large/original (`upgradeFeedThumbToLargeUrl`).
 */
export function collectProviderImageGalleryUrls(raw: Record<string, unknown>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (rawU: unknown) => {
    if (rawU == null || rawU === '') return;
    const t = upgradeFeedThumbToLargeUrl(String(rawU).trim());
    if (!t || !/^https?:\/\//i.test(t) || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };

  const imgs = raw.images;
  if (Array.isArray(imgs)) {
    for (const item of imgs) {
      if (typeof item === 'string') push(item);
      else if (item != null && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const u =
          o.url ??
          o.src ??
          o.href ??
          o.image ??
          o.large ??
          o.original ??
          o.full ??
          o.medium ??
          o.thumb ??
          o.path;
        if (u != null) push(u);
      }
    }
  }

  if (out.length === 0) {
    const fallback = pickThumbUrl(raw);
    if (fallback) push(fallback);
  }
  return out;
}

function extractProviderRecommendedRetailTry(raw: Record<string, unknown>): number | null {
  const tryNum = (v: unknown): number | null => {
    if (v == null || v === '') return null;
    const n = toNum(v);
    return n > 0 ? n : null;
  };

  const directKeys = [
    'recommended_retail_price',
    'rrp',
    'msrp',
    'suggested_retail_price',
    'retail_price',
    'recommendedRetailPrice',
  ];
  for (const k of directKeys) {
    const n = tryNum(raw[k]);
    if (n != null) return n;
  }

  const prices = raw.prices;
  if (prices != null && typeof prices === 'object') {
    const p = prices as Record<string, unknown>;
    for (const key of ['12', '10', 'rrp', 'msrp', 'retail']) {
      const block = p[key];
      if (block != null && typeof block === 'object' && 'price' in (block as object)) {
        const n = tryNum((block as Record<string, unknown>).price);
        if (n != null) return n;
      }
    }
  }
  return null;
}

function formatDevicesDisplayAll(raw: Record<string, unknown>): string | null {
  const devices = raw.devices;
  if (!Array.isArray(devices) || devices.length === 0) return null;
  const names = devices
    .map((d) => {
      if (d != null && typeof d === 'object' && 'name' in d) return toStr((d as { name?: unknown }).name);
      return typeof d === 'string' ? toStr(d) : '';
    })
    .filter(Boolean);
  return names.length ? names.join(', ') : null;
}

function slugPart(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_|.-]/gi, '')
    .slice(0, 80);
}

/** model_code öncelikli; sonra collection.id; sonra collection.name + brand.name */
export function deriveProviderCollectionGroupId(
  collection: unknown,
  brand: unknown,
  modelCode?: string | null,
): string {
  // En hassas: toptancının model kodu (farklı renkler aynı model altında)
  if (modelCode && modelCode.trim()) return `grp_mc:${slugPart(modelCode.trim())}`;

  const col = collection && typeof collection === 'object' ? (collection as Record<string, unknown>) : {};
  const colId = col.id != null ? toStr(col.id) : '';
  if (colId) return `grp_col:${slugPart(colId)}`;
  const colName = col.name != null ? toStr(col.name) : '';
  const bObj = brand && typeof brand === 'object' ? (brand as Record<string, unknown>) : {};
  const bName = bObj.name != null ? toStr(bObj.name) : '';
  const parts = [colName, bName].filter(Boolean).map(slugPart);
  return parts.length ? `grp_slug:${parts.join('|')}` : '';
}

function colorFromOptions(raw: Record<string, unknown>): string | null {
  const options = raw.options;
  if (!Array.isArray(options) || options.length === 0) return null;
  const o0 = options[0];
  if (!o0 || typeof o0 !== 'object') return null;
  const name = toStr((o0 as Record<string, unknown>).name);
  return name || null;
}

function pickThumbUrl(raw: Record<string, unknown>): string | null {
  const t = raw.thumb ?? raw.thumbnail ?? raw.image_thumb ?? raw.imageThumb;
  if (t != null && toStr(t)) return upgradeFeedThumbToLargeUrl(toStr(t));
  const imgs = raw.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    if (first && typeof first === 'object') {
      const u =
        (first as Record<string, unknown>).thumb ??
        (first as Record<string, unknown>).url ??
        (first as Record<string, unknown>).src;
      if (u != null && toStr(u)) return upgradeFeedThumbToLargeUrl(toStr(u));
    }
  }
  const single = raw.image ?? raw.image_url ?? raw.photo;
  if (single != null && toStr(single)) return upgradeFeedThumbToLargeUrl(toStr(single));
  return null;
}

/** Ham beslemeden model_code çıkar */
function extractModelCode(raw: Record<string, unknown>): string | null {
  const mc =
    raw.model_code ??
    raw.modelCode ??
    raw.model_no ??
    raw.modelNo ??
    raw.product_code ??
    raw.productCode ??
    raw.model;
  const s = mc != null ? toStr(mc) : '';
  return s || null;
}

/** Ham beslemeden manufacturer çıkar */
function extractManufacturerName(raw: Record<string, unknown>): string | null {
  const m =
    raw.manufacturer ??
    raw.manufacturer_name ??
    raw.manufacturerName;
  if (m != null && toStr(m)) return toStr(m);
  const brandObj = raw.brand;
  if (brandObj && typeof brandObj === 'object') {
    return toStr((brandObj as Record<string, unknown>).name) || null;
  }
  return null;
}

/** Veritabanı metadata: source_details + isteğe bağlı hierarchy */
function buildProviderMetadata(raw: Record<string, unknown>): Record<string, unknown> {
  const brandObj = raw.brand;
  const brandName =
    brandObj && typeof brandObj === 'object' && (brandObj as Record<string, unknown>).name != null
      ? toStr((brandObj as Record<string, unknown>).name) || null
      : null;
  const devices = raw.devices;
  let deviceName: string | null = null;
  if (Array.isArray(devices) && devices[0] && typeof devices[0] === 'object') {
    deviceName = toStr((devices[0] as Record<string, unknown>).name) || null;
  }
  const cat = toStr(raw.category);
  const descFields = providerSourceDetailsDescriptionFields(raw);
  const devicesDisplay = formatDevicesDisplayAll(raw);
  const stockStatus = toStr(raw.stock_status ?? raw.stockStatus ?? raw.availability ?? raw.availability_status);
  const rrp = extractProviderRecommendedRetailTry(raw);
  const modelCode = extractModelCode(raw);
  const manufacturer = extractManufacturerName(raw);
  const devicesPhrase = typeof descFields.devices_phrase === 'string' ? descFields.devices_phrase : null;
  const out: Record<string, unknown> = {
    source_details: {
      brand_name: brandName,
      manufacturer_name: manufacturer,
      device_name: deviceName,
      devices_display: devicesDisplay || devicesPhrase || deviceName,
      options_color_name: colorFromOptions(raw),
      stock_status: stockStatus || null,
      recommended_retail_price: rrp,
      model_code: modelCode,
      ...descFields,
      compatibility: {
        manufacturer: manufacturer ?? (descFields.compatibility as Record<string, unknown> | undefined)?.manufacturer ?? null,
        brand: brandName ?? (descFields.compatibility as Record<string, unknown> | undefined)?.brand ?? null,
        device_models_text: devicesDisplay || devicesPhrase || null,
      },
    },
  };
  if (cat && cat !== 'Genel') out.hierarchy = { category: cat };
  return out;
}

function normalizeOneProviderFeedRecord(
  raw: Record<string, unknown>,
  sharedGroupId: string,
  _tryPerUsd?: number,
): ProviderVitrinImportRow | null {
  const name = toStr(raw.name);
  if (!name) return null;

  const tryPrice = extractProviderTryListPrice11(raw.prices);
  if (tryPrice <= 0) return null;

  const sku = toStr(raw.sku);
  const barcode = toStr(raw.barcode);
  const external_id = sku || null;

  const color = colorFromOptions(raw);
  const gallery = collectProviderImageGalleryUrls(raw);
  const img = gallery[0] ?? pickThumbUrl(raw);
  const rrp = extractProviderRecommendedRetailTry(raw);
  const modelCode = extractModelCode(raw);

  const brandObj = raw.brand;
  const brandName =
    brandObj && typeof brandObj === 'object' && (brandObj as Record<string, unknown>).name != null
      ? toStr((brandObj as Record<string, unknown>).name) || null
      : null;

  const metaBase = buildProviderMetadata(raw);
  const sdPrev =
    metaBase.source_details && typeof metaBase.source_details === 'object'
      ? { ...(metaBase.source_details as Record<string, unknown>) }
      : {};
  sdPrev.barcode = barcode || null;
  sdPrev.color = color;
  const priorityDesc = extractPriorityFeedDescriptionFromRaw(raw);
  if (priorityDesc) {
    sdPrev.listing_description_plain = sanitizeFeedHtmlToPlainText(priorityDesc);
  }
  const meta = { ...metaBase, source_details: sdPrev };

  // model_code varsa sharedGroupId'yi geçersiz kıl — daha hassas eşleşme
  const effectiveGroupId = modelCode
    ? deriveProviderCollectionGroupId(null, null, modelCode)
    : sharedGroupId || null;

  const import_pricing: ProviderVitrinImportRow['import_pricing'] = null;

  return {
    name,
    external_id,
    group_id: effectiveGroupId,
    brand: brandName,
    brand_name: brandName,
    category: toStr(raw.category) || 'Genel',
    price: tryPrice,
    stock_quantity: Math.max(0, Math.floor(toNum(raw.stock ?? raw.stock_quantity ?? raw.quantity ?? 0))),
    min_order_quantity: Math.max(1, Math.floor(toNum(raw.min_order_quantity ?? raw.min_order ?? 1)) || 1),
    description: resolveProviderListingDescription(raw),
    image_url: img,
    image_urls: gallery.length > 0 ? gallery : img ? [img] : [],
    suggested_retail_price: rrp,
    currency: 'TRY',
    currency_code: 'TRY',
    variant_detail: color || null,
    metadata: meta,
    import_pricing,
  };
}

function flattenJsonProductList(parsed: unknown): Record<string, unknown>[] {
  const asObjectRows = (items: unknown[]): Record<string, unknown>[] =>
    items.filter((x): x is Record<string, unknown> => x != null && typeof x === "object") as Record<
      string,
      unknown
    >[];

  if (Array.isArray(parsed)) {
    return asObjectRows(parsed);
  }
  if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;

    // Azunlar / Meilisearch: { results: [{ hits: [...] }] }
    if (Array.isArray(o.results)) {
      const hits: Record<string, unknown>[] = [];
      for (const block of o.results) {
        if (!block || typeof block !== "object") continue;
        const blockHits = (block as Record<string, unknown>).hits;
        if (Array.isArray(blockHits)) hits.push(...asObjectRows(blockHits));
      }
      if (hits.length > 0) return hits;
    }

    if (Array.isArray(o.hits)) {
      const directHits = asObjectRows(o.hits);
      if (directHits.length > 0) return directHits;
    }

    const keys = ["products", "data", "items", "result", "rows", "content"];
    for (const k of keys) {
      const v = o[k];
      if (Array.isArray(v)) {
        const rows = asObjectRows(v);
        if (rows.length > 0) return rows;
      }
    }
  }
  return [];
}

/**
 * Sağlayıcı B2B şeması: kök dizi veya { products: [...] }.
 * Üst nesnede `variants[]` varsa her varyant ayrı satır; group_id üstten paylaşılır.
 */
export function expandProviderStyleJsonToFeedRows(
  parsed: unknown,
  opts?: ProviderFeedExpandOptions,
): ProviderVitrinImportRow[] {
  const list = flattenJsonProductList(parsed);
  const out: ProviderVitrinImportRow[] = [];
  const tryPerUsd = opts?.tryPerUsd;

  for (const item of list) {
    const topModelCode = extractModelCode(item);
    const groupId = deriveProviderCollectionGroupId(item.collection, item.brand, topModelCode);
    const variants = item.variants;
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (!v || typeof v !== 'object') continue;
        const merged = { ...item, ...(v as Record<string, unknown>) };
        const row = normalizeOneProviderFeedRecord(merged, groupId, tryPerUsd);
        if (row) out.push(row);
      }
    } else {
      const row = normalizeOneProviderFeedRecord(item, groupId, tryPerUsd);
      if (row) out.push(row);
    }
  }
  return out;
}
