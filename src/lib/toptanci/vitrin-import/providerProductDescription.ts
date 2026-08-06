/**
 * Sağlayıcı / vitrin ürün açıklaması: öncelikli feed metni veya şablon (manufacturer, brand, devices, collection, categories).
 */
import { sanitizeFeedHtmlToPlainText as sanitizeFromFeedHtml } from "./feed-html";

function getSourceDetails(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object") return null;
  const sd = (metadata as Record<string, unknown>).source_details;
  return sd && typeof sd === "object" ? (sd as Record<string, unknown>) : null;
}

export function toStr(v: unknown): string {
  return v == null || v === "" ? "" : String(v).trim();
}

export function sanitizeFeedHtmlToPlainText(input: string): string {
  return sanitizeFromFeedHtml(input);
}

function extractManufacturerFromRaw(raw: Record<string, unknown>): string {
  const m = raw.manufacturer;
  if (m == null) return '';
  if (typeof m === 'string') return toStr(m);
  if (typeof m === 'object' && m !== null && 'name' in m) return toStr((m as { name?: unknown }).name);
  return '';
}

function extractBrandNameFromRaw(raw: Record<string, unknown>): string {
  const b = raw.brand;
  if (b != null && typeof b === 'object' && 'name' in b) return toStr((b as { name?: unknown }).name);
  return '';
}

function extractDevicesPhraseFromRaw(raw: Record<string, unknown>): string {
  const devices = raw.devices;
  if (!Array.isArray(devices) || devices.length === 0) return '';
  const names = devices
    .map((d) => {
      if (d != null && typeof d === 'object' && 'name' in d) return toStr((d as { name?: unknown }).name);
      return typeof d === 'string' ? toStr(d) : '';
    })
    .filter(Boolean);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} ve ${names[names.length - 1]}`;
}

function extractCollectionNameFromRaw(raw: Record<string, unknown>): string {
  const c = raw.collection;
  if (c != null && typeof c === 'object' && 'name' in c) return toStr((c as { name?: unknown }).name);
  if (typeof c === 'string') return toStr(c);
  return '';
}

function extractCategoriesPhraseFromRaw(raw: Record<string, unknown>): string {
  const c = raw.categories;
  if (c == null) return '';
  if (typeof c === 'string') return toStr(c);
  if (Array.isArray(c)) {
    const parts = c
      .map((x) => {
        if (x == null) return '';
        if (typeof x === 'string') return toStr(x);
        if (typeof x === 'object' && 'name' in x) return toStr((x as { name?: unknown }).name);
        return '';
      })
      .filter(Boolean);
    return parts.join(', ');
  }
  return '';
}

/** XML/JSON kökünde hits[] veya iç içe hits.hits — description / content önceliği */
export function extractPriorityFeedDescriptionFromRaw(raw: Record<string, unknown>): string | null {
  const tryBlock = (o: Record<string, unknown>): string | null => {
    const t =
      toStr(o.description) ||
      toStr(o.details) ||
      toStr(o.Details) ||
      toStr(o.detail) ||
      toStr(o.content) ||
      toStr(o.Content) ||
      toStr(o.long_description) ||
      toStr(o.longDescription) ||
      toStr(o.html_description) ||
      toStr(o.text) ||
      toStr(o.body) ||
      toStr(o.summary) ||
      toStr(o.aciklama) ||
      toStr(o.Aciklama);
    return t.length ? t : null;
  };

  const direct = tryBlock(raw);
  if (direct) return direct;

  const hits = raw.hits;
  const walkHits = (arr: unknown[]): string | null => {
    for (const h of arr) {
      if (h != null && typeof h === 'object') {
        const o = h as Record<string, unknown>;
        const inner = tryBlock(o);
        if (inner) return inner;
        const src = o._source;
        if (src != null && typeof src === 'object') {
          const in2 = tryBlock(src as Record<string, unknown>);
          if (in2) return in2;
        }
      }
    }
    return null;
  };

  if (Array.isArray(hits)) {
    const r = walkHits(hits);
    if (r) return r;
  }
  if (hits != null && typeof hits === 'object' && !Array.isArray(hits)) {
    const innerHits = (hits as Record<string, unknown>).hits;
    if (Array.isArray(innerHits)) {
      const r = walkHits(innerHits);
      if (r) return r;
    }
  }

  return null;
}

/** Kullanıcı şablonuna yakın, boş alanları sadeleştirerek */
export function composeProviderTemplateDescription(raw: Record<string, unknown>): string {
  const manufacturer = extractManufacturerFromRaw(raw);
  const brand = extractBrandNameFromRaw(raw);
  const devices = extractDevicesPhraseFromRaw(raw);
  const collection = extractCollectionNameFromRaw(raw);
  const categories = extractCategoriesPhraseFromRaw(raw);

  const brandSeg = manufacturer && brand ? `${manufacturer} marka ${brand}` : manufacturer || brand || 'Kaliteli';
  const devSeg = devices ? `${devices} modeli ile tam uyumlu` : 'Uyumlu tasarımıyla';
  const colSeg = collection ? `${collection} serisi` : '';
  const catSeg = categories || '';

  const mid = [colSeg, catSeg].filter(Boolean).join(' ');
  const core = [brandSeg, devSeg, mid].filter(Boolean).join(' ');
  const out = `${core}. Şık tasarımı ve dayanıklı yapısıyla cihazınızı korur.`;
  return out.replace(/\s+/g, ' ').replace(/\s+\./g, '.').trim();
}

/** Import satırı: önce açıklama / details / content / hits (HTML temiz), yoksa şablon */
export function resolveProviderListingDescription(raw: Record<string, unknown>): string {
  const priority = extractPriorityFeedDescriptionFromRaw(raw);
  if (priority) return sanitizeFeedHtmlToPlainText(priority);
  return composeProviderTemplateDescription(raw);
}

/** source_details + isteğe bağlı kategori / isim ile şablon (DB satırları, geriye dönük) */
export function composeTemplateFromSourceDetails(
  sd: Record<string, unknown> | null,
  fallbackCategory?: string | null,
  fallbackName?: string | null,
): string | null {
  if (!sd) return null;
  const manufacturer = toStr(sd.manufacturer_name ?? sd.manufacturer);
  const brand = toStr(sd.brand_name ?? sd.brand);
  let devices = toStr(sd.devices_phrase ?? sd.device_name);
  if (!devices && Array.isArray(sd.devices)) {
    devices = (sd.devices as unknown[])
      .map((d) => {
        if (d != null && typeof d === 'object' && 'name' in (d as object))
          return toStr((d as { name?: unknown }).name);
        return typeof d === 'string' ? toStr(d) : '';
      })
      .filter(Boolean)
      .join(', ');
  }
  const collection = toStr(sd.collection_name ?? sd.collection);
  let categories = toStr(sd.categories_text ?? sd.categories);
  if (!categories && fallbackCategory && fallbackCategory !== 'Genel') categories = fallbackCategory;

  if (!manufacturer && !brand && !devices && !collection && !categories) {
    if (fallbackName) return `${fallbackName}. Şık tasarımı ve dayanıklı yapısıyla cihazınızı korur.`;
    return null;
  }

  const brandSeg = manufacturer && brand ? `${manufacturer} marka ${brand}` : manufacturer || brand || 'Kaliteli';
  const devSeg = devices ? `${devices} modeli ile tam uyumlu` : 'Uyumlu tasarımıyla';
  const colSeg = collection ? `${collection} serisi` : '';
  const catSeg = categories || '';
  const mid = [colSeg, catSeg].filter(Boolean).join(' ');
  const core = [brandSeg, devSeg, mid].filter(Boolean).join(' ');
  return `${core}. Şık tasarımı ve dayanıklı yapısıyla cihazınızı korur.`.replace(/\s+/g, ' ').trim();
}

function priorityDescriptionFromSourceDetails(sd: Record<string, unknown>): string | null {
  const t =
    toStr(sd.listing_description_plain) ||
    toStr(sd.description) ||
    toStr(sd.details) ||
    toStr(sd.content) ||
    toStr(sd.aciklama) ||
    toStr(sd.DESCRIPTION) ||
    toStr(sd.text);
  return t.length ? sanitizeFeedHtmlToPlainText(t) : null;
}

/**
 * Vitrin / market ürün detay metni: DB description → source_details açıklaması → şablon → minimal fallback.
 */
export function resolveVitrinProductDisplayDescription(row: {
  description?: unknown;
  metadata?: unknown;
  category?: unknown;
  name?: unknown;
}): string {
  const db = sanitizeFeedHtmlToPlainText(toStr(row.description));
  if (db) return db;

  const sd = getSourceDetails(row.metadata);
  if (sd) {
    const p = priorityDescriptionFromSourceDetails(sd);
    if (p) return p;
    const templ = composeTemplateFromSourceDetails(
      sd,
      row.category != null ? String(row.category) : null,
      row.name != null ? String(row.name) : null,
    );
    if (templ) return templ;
  }

  const name = toStr(row.name);
  const cat = toStr(row.category);
  if (name && cat && cat !== 'Genel') {
    return `${name} — ${cat} kategorisinde. Şık tasarımı ve dayanıklı yapısıyla cihazınızı korur.`;
  }
  if (name) return `${name}. Şık tasarımı ve dayanıklı yapısıyla cihazınızı korur.`;
  return 'Şık tasarımı ve dayanıklı yapısıyla cihazınızı korur.';
}

function extractMaterialFromRaw(raw: Record<string, unknown>): string {
  const m =
    raw.material ??
    raw.malzeme ??
    raw.materyal ??
    raw.fabric ??
    raw.Malzeme;
  return m != null ? toStr(m) : '';
}

/** Import için metadata.source_details içine yazılacak ek alanlar (marka/üretici buildProviderMetadata'da) */
export function providerSourceDetailsDescriptionFields(raw: Record<string, unknown>): Record<string, unknown> {
  const manufacturer = extractManufacturerFromRaw(raw) || null;
  const brand = extractBrandNameFromRaw(raw) || null;
  const devicesPhrase = extractDevicesPhraseFromRaw(raw) || null;
  const material = extractMaterialFromRaw(raw) || null;
  return {
    collection_name: extractCollectionNameFromRaw(raw) || null,
    categories_text: extractCategoriesPhraseFromRaw(raw) || null,
    devices_phrase: devicesPhrase,
    material: material || null,
    compatibility: {
      manufacturer,
      brand,
      device_models_text: devicesPhrase,
    },
  };
}
