// lib/vitrinXmlMappingFields.ts — XML ↔ Vitrin eşlemesi (ProviderFeed)
/** `hooks/useVitrinBulkImport` XmlMapping ile birebir aynı anahtarlar */
export type VitrinXmlMappingFieldKey =
  | 'name'
  | 'price'
  | 'cost'
  | 'id'
  | 'image_url'
  | 'brand'
  | 'brand_name'
  | 'barcode'
  | 'stock'
  | 'stock_quantity'
  | 'stock_status'
  | 'color'
  | 'color_name'
  | 'material'
  | 'description'
  | 'category'
  | 'category_path'
  | 'sub_category'
  | 'collection_id'
  | 'availability'
  | 'variant_detail'
  | 'group_id'
  | 'suggested_retail_price'
  | 'currency'
  | 'min_order_quantity';

export type VitrinXmlMappingFieldDef = {
  key: VitrinXmlMappingFieldKey;
  label: string;
  required?: boolean;
};

/**
 * XML → `toptanci_products` hedef sütunları.
 * `key` değerleri Supabase / `XmlMapping` ile birebir: brand_name, color_name, stock_quantity, stock_status, sub_category, …
 * Arayüzde "Target column" listesi bu diziyi aynen basar.
 */
export const VITRIN_XML_TARGET_FIELDS: VitrinXmlMappingFieldDef[] = [
  { key: 'name', label: 'name', required: true },
  { key: 'price', label: 'price', required: true },
  { key: 'brand_name', label: 'brand_name', required: false },
  { key: 'sub_category', label: 'sub_category', required: false },
  { key: 'color_name', label: 'color_name', required: false },
  { key: 'stock_quantity', label: 'stock_quantity', required: false },
  { key: 'stock_status', label: 'stock_status', required: false },
  { key: 'category', label: 'category', required: false },
  { key: 'category_path', label: 'category_path', required: false },
  { key: 'description', label: 'description', required: false },
  { key: 'image_url', label: 'image_url', required: false },
  { key: 'barcode', label: 'barcode', required: false },
  { key: 'min_order_quantity', label: 'min_order_quantity', required: false },
  { key: 'currency', label: 'currency', required: false },
  { key: 'suggested_retail_price', label: 'suggested_retail_price', required: false },
  { key: 'cost', label: 'cost', required: false },
  { key: 'variant_detail', label: 'variant_detail', required: false },
  { key: 'material', label: 'material', required: false },
  { key: 'availability', label: 'availability', required: false },
  { key: 'collection_id', label: 'collection_id', required: false },
  { key: 'group_id', label: 'group_id', required: false },
  { key: 'id', label: 'id (dış / harici)', required: false },
  { key: 'brand', label: 'brand (XML eski adı → brand_name ile aynı mantık)', required: false },
  { key: 'color', label: 'color (XML eski adı → color_name ile aynı mantık)', required: false },
  { key: 'stock', label: 'stock (XML eski adı → stok adedi / durum ayrıştırma)', required: false },
];

/** Geriye dönük importlar için `VITRIN_XML_TARGET_FIELDS` ile aynı. */
export const VITRIN_XML_MANUAL_MAPPING_FIELDS = VITRIN_XML_TARGET_FIELDS;

export type XmlMapping = Partial<Record<VitrinXmlMappingFieldKey, string>>;

/** Web mapping paneli — mobil VITRIN_XML_TARGET_FIELDS ile uyumlu anahtarlar */
export type VitrinXmlPanelFieldDef = {
  key: VitrinXmlMappingFieldKey;
  label: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
};

export const VITRIN_XML_PANEL_FIELDS: VitrinXmlPanelFieldDef[] = [
  { key: "barcode", label: "Barkod / IMEI", placeholder: "StokKodu", hint: "barcode" },
  { key: "name", label: "Ürün Adı", placeholder: "UrunIsmi", required: true, hint: "name" },
  { key: "price", label: "Alış Fiyatı", placeholder: "Fiyat", required: true, hint: "price" },
  { key: "stock_quantity", label: "Stok Adedi", placeholder: "Miktar", hint: "stock_quantity" },
  { key: "brand_name", label: "Marka", placeholder: "Marka", hint: "brand_name" },
  { key: "category", label: "Kategori", placeholder: "Kategori", hint: "category" },
  { key: "sub_category", label: "Alt Kategori", placeholder: "AltKategori", hint: "sub_category" },
  { key: "image_url", label: "Görsel URL", placeholder: "Resim", hint: "image_url" },
  { key: "description", label: "Açıklama", placeholder: "Aciklama", hint: "description" },
  { key: "variant_detail", label: "Varyant / Detay", placeholder: "Varyant", hint: "variant_detail" },
  { key: "color_name", label: "Renk", placeholder: "Renk", hint: "color_name" },
  { key: "currency", label: "Para Birimi", placeholder: "ParaBirimi", hint: "currency" },
  { key: "min_order_quantity", label: "Min. Sipariş", placeholder: "MinSiparis", hint: "min_order_quantity" },
];

/** Otomatik eşleme üzerine kullanıcı panel eşlemesini uygular (dolu alanlar kazanır). */
export function mergeXmlMappings(auto: XmlMapping, manual?: XmlMapping | null): XmlMapping {
  if (!manual) return auto;
  const merged: XmlMapping = { ...auto };
  for (const field of VITRIN_XML_PANEL_FIELDS) {
    const tag = manual[field.key]?.trim();
    if (tag) merged[field.key] = tag;
  }
  for (const [key, value] of Object.entries(manual)) {
    if (typeof value === "string" && value.trim()) {
      merged[key as VitrinXmlMappingFieldKey] = value.trim();
    }
  }
  return merged;
}

function tagNorm(tag: string): string {
  return tag.toLowerCase().replace(/\s/g, '');
}

/** `prices` kökü `price` içerir; gerçek fiyat alanı mı (prices.N.price, trade_price, …)? */
function hasExplicitPriceField(l: string): boolean {
  return (
    l === 'price' ||
    l.endsWith('.price') ||
    l.includes('.price.') ||
    /(^|_)price(_|$)/.test(l)
  );
}

/** Maliyet / alış etiketleri — satış fiyatı adayı değil */
function isCostLikeTag(l: string): boolean {
  if (l === 'cost' || l.includes('maliyet')) return true;
  if (l.includes('alis_fiyati') || l.includes('alisfiyati') || l.includes('alis_fiyat')) return true;
  if (l.includes('alış') || (l.includes('alis') && l.includes('fiyat') && !l.includes('satis'))) return true;
  if (l.includes('purchase_price') || l === 'purchase' || l.includes('buy_price') || l.includes('alış_fiyat')) {
    return true;
  }
  return false;
}

function isSalesPriceTag(l: string): boolean {
  if (isCostLikeTag(l)) return false;
  // Maliyet için ayrılan fiyat1 / alış kalıpları satışa düşmesin
  if (l === 'fiyat1' || l.includes('.fiyat1') || l.includes('fiyat1.')) return false;
  if (l.includes('alis') && l.includes('fiyat')) return false;

  if (l === 'price' || l === 'fiyat' || l === 'price1') return true;
  if (l.includes('tutar')) return true;
  if (l.includes('satis_fiyati') || l.includes('satış_fiyatı') || l.includes('satışfiyatı')) return true;
  if (l.includes('satis') && l.includes('fiyat')) return true;
  if (l.includes('satis') && l.includes('price')) return true;
  if (l === 'satis' || l.endsWith('.satis')) return true;
  if (l.includes('kdv_dahil_fiyat') || l.includes('kdv_dahil')) return true;
  if (l === 'trade_price' || l.includes('trade_price')) return true;
  if ((l.includes('fiyat') || hasExplicitPriceField(l)) && !l.includes('fiyat1')) return true;
  return false;
}

function isCostPriceTag(l: string): boolean {
  return (
    l === 'cost' ||
    l === 'fiyat1' ||
    l.includes('.fiyat1') ||
    l.includes('fiyat1.') ||
    l.includes('maliyet') ||
    l.includes('alis_fiyati') ||
    l.includes('alisfiyati') ||
    l.includes('alis_fiyat') ||
    l === 'alis' ||
    l.endsWith('.alis') ||
    (l.includes('alis') && l.includes('fiyat') && !l.includes('satis')) ||
    l.includes('purchase_price') ||
    l === 'purchase' ||
    l.includes('buy_price')
  );
}

function isImageTag(l: string): boolean {
  return (
    l === 'image' ||
    l === 'img' ||
    l === 'picture' ||
    l === 'resim' ||
    l === 'thumb' ||
    l.endsWith('.thumb') ||
    l.includes('image_url') ||
    l.includes('imageurl') ||
    (l.includes('picture') && !l.includes('thumbnail')) ||
    (l.includes('image') && !l.includes('thumbnail')) ||
    (l.includes('thumb') && !l.includes('thumbnail'))
  );
}

function isTitleTag(l: string): boolean {
  return (
    l === 'name' ||
    l === 'title' ||
    l === 'baslik' ||
    l === 'başlık' ||
    l === 'urun_adi' ||
    l.includes('product_name') ||
    l.includes('productname') ||
    l === 'producttitle' ||
    l.includes('urunadi')
  );
}

function isExternalIdTag(l: string): boolean {
  if (l.includes('barcode') || l.includes('barkod') || l.includes('ean')) return false;
  return (
    l === 'sku' ||
    l.includes('sku') ||
    l.includes('external_id') ||
    l.includes('externalid') ||
    l.includes('stok_kodu') ||
    l.includes('product_code') ||
    l === 'product_id' ||
    (l.includes('productid') && !l.includes('category'))
  );
}

/** SEO / meta snippet — ürün gövdesi değil; birden fazla aday varsa düşük öncelik. */
function isSeoOrMetaDescriptionPath(l: string): boolean {
  return (
    l.includes('meta_description') ||
    l.includes('metadescription') ||
    l.includes('seo_description') ||
    l.includes('seo_desc') ||
    l.includes('og_description') ||
    l.includes('og:description') ||
    l.includes('twitter_description') ||
    l.includes('facebook_description') ||
    l.includes('schema_description')
  );
}

/**
 * TR/EN ve büyük-küçük harf (çağıran `tagNorm` ile normalize etmeli): ürün açıklaması adayı.
 * İstenen anahtarlar: aciklama, urun_aciklama, detay, urun_detay, description, details, detail, content, product_description
 * — artı uzun/html gövde ve meta_description (sonuncusu pickBest ile geride kalır).
 */
export function isDescriptionLikeTag(l: string): boolean {
  if (isSeoOrMetaDescriptionPath(l)) return true;

  const exact = new Set([
    'description',
    'details',
    'detail',
    'content',
    'aciklama',
    'detay',
    'urun_aciklama',
    'urun_detay',
    'product_description',
    'açıklama',
    'ürün_açıklama',
    'ürün_detay',
    'long_description',
    'html_description',
  ]);
  if (exact.has(l)) return true;

  if (
    l.endsWith('.description') ||
    l.endsWith('.details') ||
    l.endsWith('.detail') ||
    l.endsWith('.content') ||
    l.endsWith('.aciklama') ||
    l.endsWith('.detay') ||
    l.endsWith('.urun_aciklama') ||
    l.endsWith('.urun_detay') ||
    l.endsWith('.product_description')
  ) {
    return true;
  }

  if (l.includes('urun_aciklama') || l.includes('ürün_açıklama')) return true;
  if (l.includes('urun_detay') || l.includes('ürün_detay')) return true;
  if (l.includes('product_description')) return true;
  if (l.includes('listing_description') || l.includes('full_description') || l.includes('detail_text')) return true;
  if (l.includes('long_description') || l.includes('longdescription') || l.includes('html_description')) return true;
  if (l === 'body' || l.endsWith('.body') || l.includes('.body.')) return true;
  if (l.includes('fulltext') || l.includes('full_text')) return true;

  if (l.includes('aciklama') || l.includes('açıklama')) return true;
  if (l.includes('detay') && !l.includes('fiyat') && !l.includes('price') && !l.includes('tutar')) return true;

  if (l.includes('description') && !l.includes('uuid') && !l.includes('meta_title') && !l.includes('seo_title')) {
    return true;
  }

  if (l === 'info' || l === 'urun_bilgi' || l === 'urunbilgi' || l === 'product_info' || l === 'bilgi') return true;
  if (l.includes('info_text') || l.includes('info_html') || l.includes('info_content') || l.includes('aciklama_info')) {
    return true;
  }
  if (l.endsWith('.info') || l.includes('.urun_bilgi') || l.includes('urun_bilgi') || l.includes('product_info')) {
    if (l.includes('image') && l.includes('info')) return false;
    if (l.includes('price_info') || l.includes('fiyat_bilgi')) return false;
    return true;
  }

  return false;
}

/** HTML/XML gövdeyi kabaca düz metin uzunluğuna çevirir — hangi etiket gerçek ürün metnidir karşılaştırması için. */
export function descriptionSamplePlainLength(val: unknown): number {
  if (val == null || val === '') return 0;
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val).length;
    } catch {
      return 0;
    }
  }
  const s = String(val).trim();
  if (!s) return 0;
  const plain = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length;
}

const DESCRIPTION_CONTENT_SAMPLE_ROWS = 15;

export type XmlAutoMappingSampleContext = {
  flatItems: Record<string, unknown>[];
  getNestedVal: (item: Record<string, unknown>, path: string) => unknown;
};

/**
 * Açıklama adayları içinden, örnek ürün satırlarında düz metni **en uzun** olanı seçer (`description` kolonu).
 * Örn. `detay` kısa, `açıklama` uzunsa → `açıklama` kazanır.
 */
export function pickBestDescriptionXmlTagByContentLength(
  tags: string[],
  flatItems: Record<string, unknown>[],
  getVal: (item: Record<string, unknown>, path: string) => unknown,
): string | undefined {
  const candidates = tags.filter((tag) => isDescriptionLikeTag(tagNorm(tag)));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];

  const rowLimit = Math.min(flatItems.length, DESCRIPTION_CONTENT_SAMPLE_ROWS);
  if (rowLimit === 0) return pickBestDescriptionXmlTag(tags);

  const maxLenByTag = new Map<string, number>();
  for (const tag of candidates) {
    let maxL = 0;
    for (let r = 0; r < rowLimit; r++) {
      const item = flatItems[r];
      if (!item || typeof item !== 'object') continue;
      const n = descriptionSamplePlainLength(getVal(item, tag));
      if (n > maxL) maxL = n;
    }
    maxLenByTag.set(tag, maxL);
  }

  if (candidates.every((t) => (maxLenByTag.get(t) ?? 0) === 0)) {
    return pickBestDescriptionXmlTag(tags);
  }

  return [...candidates].sort((a, b) => {
    const la = maxLenByTag.get(a) ?? 0;
    const lb = maxLenByTag.get(b) ?? 0;
    if (lb !== la) return lb - la;
    return descriptionTagTieBreak(a, b);
  })[0];
}

function descriptionTagTieBreak(a: string, b: string): number {
  const la = tagNorm(a);
  const lb = tagNorm(b);
  const tier = (l: string) =>
    isSeoOrMetaDescriptionPath(l) ? 2 : l.includes('long_description') || l.includes('html_description') ? 1 : 0;
  const d = tier(la) - tier(lb);
  if (d !== 0) return d;
  if (a.split('.').length !== b.split('.').length) return a.split('.').length - b.split('.').length;
  return a.length - b.length;
}

/** Birden fazla açıklama alanı varsa: meta/SEO değil → daha kısa yol → daha kısa etiket. */
export function pickBestDescriptionXmlTag(tags: string[]): string | undefined {
  const candidates = tags.filter((tag) => isDescriptionLikeTag(tagNorm(tag)));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];

  const scored = candidates.map((tag) => {
    const l = tagNorm(tag);
    let tier = 0;
    if (isSeoOrMetaDescriptionPath(l)) tier = 2;
    else if (l.includes('long_description') || l.includes('html_description')) tier = 1;

    const depth = tag.split('.').length;
    const len = tag.length;

    return { tag, tier, depth, len };
  });

  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.len - b.len;
  });

  return scored[0]?.tag;
}

// ─── Marka / renk / alt kategori / stok — çoklu adayda tier + kısa yol ─────────

function isBrandNameLikeTag(l: string): boolean {
  return (
    l === 'brand' ||
    l === 'marka' ||
    l.endsWith('.brand') ||
    l.endsWith('.marka') ||
    l.includes('brand_name') ||
    l.includes('brandname') ||
    l.includes('manufacturer') ||
    l.includes('maker') ||
    l.includes('uretici') ||
    l === 'vendor'
  );
}

function brandNameTagTier(l: string): number {
  if (l.includes('manufacturer') && !l.includes('id')) return 0;
  if (l === 'brand' || l === 'marka' || l.endsWith('.brand') || l.endsWith('.marka')) return 0;
  if (l.includes('brand_name') || l.includes('brandname')) return 0;
  return 1;
}

export function pickBestBrandNameXmlTag(tags: string[]): string | undefined {
  const candidates = tags.filter((tag) => isBrandNameLikeTag(tagNorm(tag)));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  const scored = candidates.map((tag) => ({
    tag,
    tier: brandNameTagTier(tagNorm(tag)),
    depth: tag.split('.').length,
    len: tag.length,
  }));
  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.len - b.len;
  });
  return scored[0]?.tag;
}

function isColorNameLikeTag(l: string): boolean {
  return (
    l === 'color' ||
    l === 'renk' ||
    l === 'colour' ||
    l === 'colorname' ||
    l.includes('color_name') ||
    l.includes('renk_adi') ||
    l.includes('urun_rengi') ||
    l.includes('option_color') ||
    l.includes('variant_name') ||
    l.includes('variantname') ||
    l === 'options' ||
    l.endsWith('.options') ||
    (l.includes('option') && (l.includes('color') || l.includes('renk'))) ||
    l.endsWith('.color') ||
    l.endsWith('.renk')
  );
}

function colorNameTagTier(l: string): number {
  if (l.includes('renk_adi') || l.includes('color_name')) return 0;
  if (l.includes('variant_name') || l.includes('variantname')) return 0;
  if (l === 'color' || l === 'renk' || l === 'colour' || l.endsWith('.color') || l.endsWith('.renk')) return 0;
  if (l.includes('option') && (l.includes('color') || l.includes('renk'))) return 1;
  if (l === 'options' || l.endsWith('.options')) return 2;
  return 1;
}

export function pickBestColorNameXmlTag(tags: string[]): string | undefined {
  const candidates = tags.filter((tag) => isColorNameLikeTag(tagNorm(tag)));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  const scored = candidates.map((tag) => {
    const l = tagNorm(tag);
    return {
      tag,
      tier: colorNameTagTier(l),
      depth: tag.split('.').length,
      len: tag.length,
    };
  });
  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.len - b.len;
  });
  return scored[0]?.tag;
}

function isSubCategoryLikeTag(l: string): boolean {
  if (l.includes('subscription') || l.includes('subtotal')) return false;
  return (
    l.includes('sub_category') ||
    l.includes('subcategory') ||
    l.includes('sub_cat') ||
    l.includes('subcat') ||
    l.includes('alt_kategori') ||
    l.includes('altkategori') ||
    l.includes('secondary_category') ||
    l.includes('child_category') ||
    l.includes('kategori_2') ||
    l.includes('kategori2') ||
    l.includes('second_category') ||
    l.includes('sub_line') ||
    l.includes('subline') ||
    l === 'sub' ||
    l.endsWith('.sub') ||
    (l.includes('grup') && !l.includes('grups')) ||
    l === 'model' ||
    l.endsWith('.model') ||
    (l.includes('.model.') && !l.includes('device_model'))
  );
}

function subCategoryTagTier(l: string): number {
  if (l.includes('sub_category') || l.includes('kategori_2') || l.includes('kategori2') || l.includes('alt_kategori'))
    return 0;
  if (l.includes('sub_cat') || l.includes('subcat') || l === 'sub' || l.endsWith('.sub')) return 1;
  if (l.includes('grup')) return 1;
  if (l.includes('model')) return 2;
  return 2;
}

export function pickBestSubCategoryXmlTag(tags: string[]): string | undefined {
  const candidates = tags.filter((tag) => isSubCategoryLikeTag(tagNorm(tag)));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  const scored = candidates.map((tag) => {
    const l = tagNorm(tag);
    return {
      tag,
      tier: subCategoryTagTier(l),
      depth: tag.split('.').length,
      len: tag.length,
    };
  });
  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.len - b.len;
  });
  return scored[0]?.tag;
}

/** Stok metni (Var/Yok, availability) — adet alanına karışmasın */
function isStockStatusOnlyLikeTag(l: string): boolean {
  return (
    l.includes('stok_durum') ||
    l.includes('stock_status') ||
    l === 'availability' ||
    l.endsWith('.availability') ||
    (l.includes('availab') && (l.includes('status') || l.includes('text'))) ||
    l.includes('instock') ||
    l.includes('in_stock') ||
    l.includes('var_mi') ||
    l.includes('is_in_stock') ||
    l.includes('stock_flag')
  );
}

/** Sayısal stok adayı (stok_adedi, quantity, adet …) */
function isStockQuantityLikeTag(l: string): boolean {
  if (isStockStatusOnlyLikeTag(l)) return false;
  if (l.includes('fiyat') || l.includes('price') || l.includes('cost')) return false;
  if (l.includes('order') && l.includes('amount')) return false;
  if (l.includes('discount') && l.includes('amount')) return false;
  return (
    l.includes('stok_adedi') ||
    l.includes('stokadedi') ||
    l.includes('stock_quantity') ||
    l.includes('stockcount') ||
    l.includes('stock_count') ||
    l === 'quantity' ||
    l.endsWith('.quantity') ||
    l === 'qty' ||
    l.endsWith('.qty') ||
    l === 'adet' ||
    l.includes('inventory') ||
    l.includes('on_hand') ||
    l.includes('onhand') ||
    l.includes('stok_miktari') ||
    l.includes('miktar') ||
    l.includes('bakiye') ||
    l.includes('stock_amount') ||
    l.includes('qty_amount') ||
    ((l.includes('stock') || l.includes('stok') || l.includes('qty') || l.includes('quantity')) &&
      l.includes('amount')) ||
    (l.includes('stok') && !l.includes('durum') && !l.includes('status')) ||
    l === 'stock'
  );
}

function stockQuantityTagTier(l: string): number {
  if (l.includes('stok_adedi') || l.includes('stock_quantity') || l.includes('stock_count')) return 0;
  if (l.includes('bakiye')) return 0;
  if (l === 'quantity' || l.endsWith('.quantity') || l === 'qty' || l === 'adet' || l.includes('miktar')) return 0;
  if (l === 'stock' || l === 'stok') return 1;
  if (l.includes('amount')) return 2;
  return 2;
}

export function pickBestStockQuantityXmlTag(tags: string[]): string | undefined {
  const candidates = tags.filter((tag) => isStockQuantityLikeTag(tagNorm(tag)));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  const scored = candidates.map((tag) => {
    const l = tagNorm(tag);
    return {
      tag,
      tier: stockQuantityTagTier(l),
      depth: tag.split('.').length,
      len: tag.length,
    };
  });
  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.len - b.len;
  });
  return scored[0]?.tag;
}

function isStockStatusLikeTag(l: string): boolean {
  return (
    l.includes('stok_durum') ||
    l.includes('stock_status') ||
    l === 'availability' ||
    l.endsWith('.availability') ||
    (l.includes('availab') && !l.includes('quantity')) ||
    l.includes('instock') ||
    l.includes('in_stock') ||
    l.includes('var_mi') ||
    l.includes('is_in_stock')
  );
}

function stockStatusTagTier(l: string): number {
  if (l.includes('stok_durum') || l.includes('stock_status')) return 0;
  if (l === 'availability' || l.endsWith('.availability')) return 1;
  return 2;
}

export function pickBestStockStatusXmlTag(tags: string[]): string | undefined {
  const candidates = tags.filter((tag) => isStockStatusLikeTag(tagNorm(tag)));
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  const scored = candidates.map((tag) => ({
    tag,
    tier: stockStatusTagTier(tagNorm(tag)),
    depth: tag.split('.').length,
    len: tag.length,
  }));
  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.len - b.len;
  });
  return scored[0]?.tag;
}

/** İlk eşleşen etiketle manuel 5 alanı varsayılan doldur (kullanıcı yine değiştirebilir). */
function applyManualFieldDefaults(
  mapping: XmlMapping,
  tags: string[],
  sampleContext?: XmlAutoMappingSampleContext,
): void {
  for (const tag of tags) {
    const l = tagNorm(tag);
    if (!mapping.name && isTitleTag(l)) mapping.name = tag;
  }
  for (const tag of tags) {
    const l = tagNorm(tag);
    if (!mapping.price && isSalesPriceTag(l)) mapping.price = tag;
  }
  for (const tag of tags) {
    const l = tagNorm(tag);
    if (!mapping.cost && isCostPriceTag(l)) mapping.cost = tag;
  }
  for (const tag of tags) {
    const l = tagNorm(tag);
    if (!mapping.image_url && isImageTag(l)) mapping.image_url = tag;
  }
  for (const tag of tags) {
    const l = tagNorm(tag);
    if (!mapping.id && isExternalIdTag(l)) mapping.id = tag;
  }
  if (!mapping.description) {
    const best =
      sampleContext?.flatItems?.length && sampleContext.getNestedVal
        ? pickBestDescriptionXmlTagByContentLength(tags, sampleContext.flatItems, sampleContext.getNestedVal)
        : pickBestDescriptionXmlTag(tags);
    if (best) mapping.description = best;
  }

  if (!mapping.brand_name) {
    const b = pickBestBrandNameXmlTag(tags);
    if (b) mapping.brand_name = b;
  }
  if (!mapping.brand && mapping.brand_name) mapping.brand = mapping.brand_name;

  if (!mapping.color_name) {
    const c = pickBestColorNameXmlTag(tags);
    if (c) mapping.color_name = c;
  }
  if (!mapping.color && mapping.color_name) mapping.color = mapping.color_name;

  if (!mapping.sub_category) {
    const sc = pickBestSubCategoryXmlTag(tags);
    if (sc) mapping.sub_category = sc;
  }

  if (!mapping.stock_quantity) {
    const sq = pickBestStockQuantityXmlTag(tags);
    if (sq) mapping.stock_quantity = sq;
  }
  if (!mapping.stock && mapping.stock_quantity) mapping.stock = mapping.stock_quantity;

  if (!mapping.stock_status) {
    const ss = pickBestStockStatusXmlTag(tags);
    if (ss) mapping.stock_status = ss;
  }
  if (!mapping.availability && mapping.stock_status) mapping.availability = mapping.stock_status;
}

/**
 * Otomatik alanlar + Title / Sales Price / Cost / Image / External ID için akıllı varsayılanlar.
 * `sampleContext`: düz ürün satırları + path okuyucu verilirse `description`, örnek metinleri **en uzun** olan etikete eşlenir.
 */
export function buildXmlAutoMapping(tags: string[], sampleContext?: XmlAutoMappingSampleContext): XmlMapping {
  const mapping: XmlMapping = {};
  tags.forEach((tag) => {
    const l = tagNorm(tag);

    if (
      !mapping.barcode &&
      (l.includes('barcode') || l.includes('barkod') || l.includes('ean') || l.includes('upc') || l.includes('gtin'))
    ) {
      mapping.barcode = tag;
    }
    if (
      !mapping.material &&
      (l.includes('material') ||
        l.includes('malzeme') ||
        l.includes('fabric') ||
        l.includes('kumas') ||
        l.includes('kumaş') ||
        l.includes('texture') ||
        l.includes('dokuma'))
    ) {
      mapping.material = tag;
    }
    if (!mapping.category && (l === 'category' || l === 'kategori') && !l.includes('path')) mapping.category = tag;
    if (
      !mapping.category_path &&
      (l.includes('category_path') ||
        l.includes('categorypath') ||
        l.includes('breadcrumb') ||
        (l.endsWith('path') && l.includes('categor')))
    ) {
      mapping.category_path = tag;
    }

    if (
      !mapping.collection_id &&
      (l === 'collection' ||
        l.includes('koleksiyon') ||
        l.includes('collection_id') ||
        l.includes('collectionid') ||
        (l.startsWith('collection') && !l.includes('group')))
    ) {
      mapping.collection_id = tag;
    }

    if (
      !mapping.availability &&
      !mapping.stock_status &&
      (l === 'availability' || l === 'instock' || l.includes('stockstatus'))
    ) {
      mapping.availability = tag;
    }
    if (!mapping.min_order_quantity && (l.includes('min_order') || l.includes('minorder'))) mapping.min_order_quantity = tag;
    if (!mapping.currency && (l === 'currency' || l === 'para_birimi' || l === 'curr')) mapping.currency = tag;

    if (
      !mapping.variant_detail &&
      (l.includes('variant') || l.includes('varyant') || l.includes('subtitle') || l.includes('secenek') || l === 'option')
    ) {
      mapping.variant_detail = tag;
    }

    if (
      !mapping.group_id &&
      (l.includes('group_id') ||
        l.includes('groupid') ||
        l === 'item_group' ||
        l.includes('itemgroup') ||
        (l.includes('group') && !l.includes('collection')))
    ) {
      mapping.group_id = tag;
    }

    if (
      !mapping.suggested_retail_price &&
      (l.includes('msrp') ||
        l.includes('suggested') ||
        l.includes('tavsiye') ||
        l.includes('oneri') ||
        l.includes('retail_price') ||
        (l.includes('list_price') && !l.includes('trade')))
    ) {
      mapping.suggested_retail_price = tag;
    }
  });

  applyManualFieldDefaults(mapping, tags, sampleContext);
  return mapping;
}

/**
 * id / url / key ağırlıklı teknik yollar — seçicide altta "Diğer" grubunda.
 * Ana alan adayları (başlık, fiyat, maliyet, görsel, dış ID) ve fiyat/tutar içeren alanlar hariç.
 */
export function isLikelyTechnicalNoiseTag(tag: string): boolean {
  const l = tagNorm(tag);

  if (
    isTitleTag(l) ||
    isSalesPriceTag(l) ||
    isCostPriceTag(l) ||
    isImageTag(l) ||
    isExternalIdTag(l) ||
    isDescriptionLikeTag(l)
  ) {
    return false;
  }

  if (l.includes('fiyat') || hasExplicitPriceField(l) || l.includes('tutar')) return false;
  if (l.includes('name') || l.includes('title') || l.includes('baslik') || l.includes('urun')) return false;
  if (l.includes('image') || l.includes('img') || l.includes('resim') || l.includes('picture')) return false;
  if (l.includes('image_url') || l.includes('imageurl')) return false;
  if (l.includes('sku') || l.includes('thumb')) return false;
  if (isStockQuantityLikeTag(l) || isStockStatusLikeTag(l) || isColorNameLikeTag(l) || isSubCategoryLikeTag(l)) {
    return false;
  }
  if (isBrandNameLikeTag(l)) return false;
  if (l.includes('stock') || l.includes('stok') || l.includes('quantity')) return false;

  if (l.includes('.id') || l.includes('_id') || l.endsWith('.id')) return true;
  if ((l.includes('url') || l.includes('.key') || l.includes('_key')) && !l.includes('image_url')) return true;
  if (l.includes('uuid') || l.includes('guid')) return true;
  if (l.includes('slug') && !l.includes('name') && !l.includes('product')) return true;
  if (l.includes('tags.') && (l.includes('.id') || l.endsWith('id'))) return true;
  if (l.includes('brand.id') || l.includes('categories.id') || l.includes('collection.id')) return true;
  if (l.includes('variants.id')) return true;

  return false;
}

export type XmlTagPickerRow = { id: string; tag?: string; sample?: string };

export type XmlTagPickerSection = {
  title: string;
  data: XmlTagPickerRow[];
};

/** Filtrelenmiş etiketleri "Önerilen" + "Diğer (teknik)" bölümlerine ayırır; başta — Boş — satırı. */
export function buildXmlTagPickerSections(
  filteredTags: string[],
  sampleByTag?: Record<string, string>,
): XmlTagPickerSection[] {
  const samp = sampleByTag ?? {};
  const row = (t: string): XmlTagPickerRow => ({ id: t, tag: t, sample: samp[t] ?? '' });
  const primary = filteredTags.filter((t) => !isLikelyTechnicalNoiseTag(t)).sort((a, b) => a.localeCompare(b));
  const other = filteredTags.filter((t) => isLikelyTechnicalNoiseTag(t)).sort((a, b) => a.localeCompare(b));
  const out: XmlTagPickerSection[] = [{ title: '', data: [{ id: '__empty' }] }];
  if (primary.length) out.push({ title: 'Önerilen', data: primary.map(row) });
  if (other.length) out.push({ title: 'Diğer (teknik)', data: other.map(row) });
  return out;
}
