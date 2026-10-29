import "server-only";

import type {
  TrendyolKategoriDugumu,
  TrendyolKategoriOzelligi,
  TrendyolUrunItem,
} from "@/lib/pazaryeri/trendyol/payload";

/**
 * Trendyol satıcı API istemcisi.
 * Belgeler: https://developers.trendyol.com (Ürün V2 servisleri).
 * - Kimlik: Basic auth (API key : API secret), her satıcıya özel.
 * - User-Agent zorunlu, yoksa 403: "{satıcıId} - SelfIntegration".
 * - storeFrontCode başlığı marka/kategori servislerinde zorunlu (Türkiye: TR).
 * - Aynı uca 10 saniyede en fazla 50 istek; aşılırsa 429.
 */

const TRENDYOL_BASE_URL = "https://apigw.trendyol.com";
const STORE_FRONT_CODE = "TR";
const REQUEST_TIMEOUT_MS = 20_000;

export type TrendyolKimlik = {
  saticiId: string;
  apiKey: string;
  apiSecret: string;
};

export class TrendyolApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, message: string, detail = "") {
    super(message);
    this.name = "TrendyolApiError";
    this.status = status;
    this.detail = detail;
  }
}

function userMessageForStatus(status: number): string {
  if (status === 401) {
    return "Trendyol bilgileri hatalı. Satıcı ID, API key ve API secret değerlerini Trendyol satıcı panelindeki Entegrasyon Bilgileri sayfasından kontrol edin.";
  }
  if (status === 403) {
    return "Trendyol bu isteği reddetti. Hesabınızın API erişimi açık mı, kontrol edin.";
  }
  if (status === 404) {
    return "Trendyol'da istenen kayıt bulunamadı.";
  }
  if (status === 429) {
    return "Trendyol'a kısa sürede çok fazla istek gitti. Bir dakika sonra tekrar deneyin.";
  }
  if (status >= 500) {
    return "Trendyol şu an yanıt vermiyor. Birkaç dakika sonra tekrar deneyin.";
  }
  return "Trendyol isteği kabul etmedi.";
}

function extractErrorDetail(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  const errors = record.errors;
  if (Array.isArray(errors)) {
    const messages = errors
      .map((e) =>
        e && typeof e === "object" ? String((e as Record<string, unknown>).message ?? "") : ""
      )
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  for (const key of ["message", "exception", "error"]) {
    if (typeof record[key] === "string") return record[key] as string;
  }
  return "";
}

async function trendyolFetch<T>(
  kimlik: TrendyolKimlik,
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {}
): Promise<T> {
  const auth = Buffer.from(`${kimlik.apiKey}:${kimlik.apiSecret}`).toString("base64");
  let response: Response;

  try {
    response = await fetch(`${TRENDYOL_BASE_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "User-Agent": `${kimlik.saticiId} - SelfIntegration`,
        storeFrontCode: STORE_FRONT_CODE,
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new TrendyolApiError(
      0,
      timedOut
        ? "Trendyol zamanında yanıt vermedi. Tekrar deneyin."
        : "Trendyol'a bağlanılamadı. İnternet bağlantısını kontrol edip tekrar deneyin.",
      err instanceof Error ? err.message : String(err)
    );
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const detail = extractErrorDetail(body) || (typeof body === "string" ? body.slice(0, 300) : "");
    throw new TrendyolApiError(response.status, userMessageForStatus(response.status), detail);
  }

  return body as T;
}

function sellerPath(kimlik: TrendyolKimlik, rest: string) {
  return `/integration/product/sellers/${encodeURIComponent(kimlik.saticiId)}${rest}`;
}

/** Bilgilerin doğru olduğunu satıcıya özel, salt-okunur bir istekle kontrol eder. */
export async function testTrendyolBaglanti(kimlik: TrendyolKimlik): Promise<void> {
  await trendyolFetch(kimlik, sellerPath(kimlik, "/products/approved?page=0&size=1"));
}

// Kategori ağacı tüm satıcılar için aynıdır; sunucu belleğinde bir gün tutulur.
let kategoriCache: { at: number; data: TrendyolKategoriDugumu[] } | null = null;
const KATEGORI_TTL_MS = 24 * 60 * 60 * 1000;

export async function getTrendyolKategoriAgaci(
  kimlik: TrendyolKimlik
): Promise<TrendyolKategoriDugumu[]> {
  if (kategoriCache && Date.now() - kategoriCache.at < KATEGORI_TTL_MS) {
    return kategoriCache.data;
  }
  const body = await trendyolFetch<{ categories?: TrendyolKategoriDugumu[] }>(
    kimlik,
    "/integration/product/product-categories"
  );
  const data = Array.isArray(body?.categories) ? body.categories : [];
  if (data.length) kategoriCache = { at: Date.now(), data };
  return data;
}

type RawCategoryAttribute = {
  allowCustom?: boolean;
  required?: boolean;
  attribute?: { id?: number; name?: string };
};

export async function getTrendyolKategoriOzellikleri(
  kimlik: TrendyolKimlik,
  kategoriId: number
): Promise<TrendyolKategoriOzelligi[]> {
  const body = await trendyolFetch<{ categoryAttributes?: RawCategoryAttribute[] }>(
    kimlik,
    `/integration/product/categories/${kategoriId}/attributes`
  );
  const raw = Array.isArray(body?.categoryAttributes) ? body.categoryAttributes : [];
  return raw
    .filter((a) => typeof a.attribute?.id === "number")
    .map((a) => ({
      attributeId: a.attribute!.id as number,
      name: a.attribute?.name ?? `Özellik ${a.attribute!.id}`,
      required: Boolean(a.required),
      allowCustom: Boolean(a.allowCustom),
    }));
}

export type TrendyolOzellikDegeri = { id: number; ad: string };

export async function getTrendyolOzellikDegerleri(
  kimlik: TrendyolKimlik,
  kategoriId: number,
  ozellikId: number
): Promise<TrendyolOzellikDegeri[]> {
  const sonuc: TrendyolOzellikDegeri[] = [];
  // Çoğu özelliğin değeri azdır; güvenlik için en fazla 5 sayfa (5.000 değer).
  for (let page = 0; page < 5; page += 1) {
    const body = await trendyolFetch<{
      content?: { attributeValueId?: number; attributeValue?: string }[];
      totalPages?: number;
    }>(
      kimlik,
      `/integration/product/categories/${kategoriId}/attributes/${ozellikId}/values?page=${page}&size=1000`
    );
    for (const item of body?.content ?? []) {
      if (typeof item.attributeValueId === "number") {
        sonuc.push({ id: item.attributeValueId, ad: item.attributeValue ?? String(item.attributeValueId) });
      }
    }
    const totalPages = typeof body?.totalPages === "number" ? body.totalPages : 1;
    if (page + 1 >= totalPages) break;
  }
  return sonuc;
}

export type TrendyolMarka = { id: number; ad: string };

export async function searchTrendyolMarka(
  kimlik: TrendyolKimlik,
  ad: string
): Promise<TrendyolMarka[]> {
  const body = await trendyolFetch<unknown>(
    kimlik,
    `/integration/product/brands/by-name?name=${encodeURIComponent(ad)}`
  );
  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { brands?: unknown[] } | null)?.brands)
      ? (body as { brands: unknown[] }).brands
      : [];
  return list
    .map((b) => b as { id?: number; name?: string })
    .filter((b) => typeof b.id === "number" && typeof b.name === "string")
    .map((b) => ({ id: b.id as number, ad: b.name as string }))
    .slice(0, 30);
}

export async function createTrendyolUrunler(
  kimlik: TrendyolKimlik,
  items: TrendyolUrunItem[]
): Promise<string> {
  const body = await trendyolFetch<{ batchRequestId?: string }>(
    kimlik,
    sellerPath(kimlik, "/v2/products"),
    { method: "POST", body: { items } }
  );
  if (!body?.batchRequestId) {
    throw new TrendyolApiError(200, "Trendyol işlem numarası döndürmedi. Tekrar deneyin.");
  }
  return body.batchRequestId;
}

export type TrendyolBatchSonucu = {
  tamamlandi: boolean;
  ogeler: { barkod: string; basarili: boolean; hatalar: string[] }[];
};

type RawBatch = {
  status?: string;
  items?: {
    status?: string;
    failureReasons?: unknown[];
    requestItem?: { barcode?: string; product?: { barcode?: string } };
  }[];
};

function failureReasonText(reason: unknown): string {
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") {
    const r = reason as Record<string, unknown>;
    return String(r.message ?? r.reason ?? r.description ?? JSON.stringify(r));
  }
  return String(reason);
}

export async function getTrendyolBatchSonucu(
  kimlik: TrendyolKimlik,
  batchRequestId: string
): Promise<TrendyolBatchSonucu> {
  const body = await trendyolFetch<RawBatch>(
    kimlik,
    sellerPath(kimlik, `/products/batch-requests/${encodeURIComponent(batchRequestId)}`)
  );
  const ogeler = (body?.items ?? []).map((item) => ({
    barkod: item.requestItem?.barcode ?? item.requestItem?.product?.barcode ?? "",
    basarili: item.status === "SUCCESS",
    hatalar: (item.failureReasons ?? []).map(failureReasonText).filter(Boolean),
  }));
  // Stok-fiyat işlemlerinde üst seviye durum gelmez; öğe durumları belirleyicidir.
  const ogelerBitti = ogeler.length > 0 && ogeler.every((o) => o.basarili || o.hatalar.length > 0);
  const tamamlandi = body?.status === "COMPLETED" || (body?.status === undefined && ogelerBitti);
  return { tamamlandi, ogeler };
}

/** Barkodun onaylı (yayında) ürünler arasında olup olmadığını kontrol eder. */
export async function isTrendyolUrunOnayli(
  kimlik: TrendyolKimlik,
  barkod: string
): Promise<boolean> {
  const body = await trendyolFetch<{ content?: unknown[] }>(
    kimlik,
    sellerPath(kimlik, `/products/approved?barcode=${encodeURIComponent(barkod)}&page=0&size=5`)
  );
  // Filtre parametresi yok sayılırsa başka ürünler dönebilir; bu yüzden
  // sayıya değil, dönen kayıtlarda bu barkodun gerçekten geçmesine bakıyoruz.
  const content = Array.isArray(body?.content) ? body.content : [];
  const needle = `"barcode":${JSON.stringify(barkod)}`;
  return content.some((item) => JSON.stringify(item).includes(needle));
}

export async function updateTrendyolStokFiyat(
  kimlik: TrendyolKimlik,
  items: { barcode: string; quantity: number; salePrice: number; listPrice: number }[]
): Promise<string> {
  const body = await trendyolFetch<{ batchRequestId?: string }>(
    kimlik,
    `/integration/inventory/sellers/${encodeURIComponent(kimlik.saticiId)}/products/price-and-inventory`,
    { method: "POST", body: { items } }
  );
  if (!body?.batchRequestId) {
    throw new TrendyolApiError(200, "Trendyol işlem numarası döndürmedi. Tekrar deneyin.");
  }
  return body.batchRequestId;
}
