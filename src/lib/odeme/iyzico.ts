import "server-only";

import {
  buildIyzicoAuthorization,
  formatIyzicoPrice,
  generateIyzicoRandomKey,
} from "@/lib/odeme/iyzico-utils";

const SANDBOX_BASE_URL = "https://sandbox-api.iyzipay.com";
const PATH_INITIALIZE = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const PATH_RETRIEVE = "/payment/iyzipos/checkoutform/auth/ecom/detail";
const ISTEK_ZAMAN_ASIMI_MS = 20_000;

type IyzicoConfig = { apiKey: string; secretKey: string; baseUrl: string };

/** Anahtarlar yalnızca sunucu ortam değişkenlerinden okunur; varsayılan uç nokta sandbox'tır. */
export function getIyzicoConfig(): IyzicoConfig | null {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  if (!apiKey || !secretKey) return null;
  const baseUrl = (process.env.IYZICO_BASE_URL?.trim() || SANDBOX_BASE_URL).replace(/\/+$/, "");
  return { apiKey, secretKey, baseUrl };
}

export function isIyzicoSandbox(): boolean {
  return (getIyzicoConfig()?.baseUrl ?? SANDBOX_BASE_URL).includes("sandbox");
}

async function iyzicoPost(
  cfg: IyzicoConfig,
  path: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const json = JSON.stringify(body);
  const randomKey = generateIyzicoRandomKey();
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: buildIyzicoAuthorization(cfg.apiKey, cfg.secretKey, path, json, randomKey),
      "x-iyzi-rnd": randomKey,
    },
    body: json,
    cache: "no-store",
    signal: AbortSignal.timeout(ISTEK_ZAMAN_ASIMI_MS),
  });
  return (await res.json()) as Record<string, unknown>;
}

export type IyzicoAlici = {
  id: string;
  ad: string;
  soyad: string;
  kimlikNo: string;
  eposta: string;
  telefon: string;
  adres: string;
  il: string;
  ip: string;
};

export type CheckoutBaslatGirdi = {
  conversationId: string;
  basketId: string;
  tutar: number;
  urunId: string;
  urunAdi: string;
  callbackUrl: string;
  alici: IyzicoAlici;
};

export async function iyzicoCheckoutBaslat(
  girdi: CheckoutBaslatGirdi
): Promise<{ ok: true; token: string; paymentPageUrl: string } | { ok: false; error: string }> {
  const cfg = getIyzicoConfig();
  if (!cfg) return { ok: false, error: "İyzico yapılandırması eksik." };

  const fiyat = formatIyzicoPrice(girdi.tutar);
  const a = girdi.alici;
  const body = {
    locale: "tr",
    conversationId: girdi.conversationId,
    price: fiyat,
    paidPrice: fiyat,
    currency: "TRY",
    basketId: girdi.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: girdi.callbackUrl,
    // Taksit kapalı: taksit vade farkı ödenen tutarı değiştirir, doğrulama tutar eşitliğine dayanır
    enabledInstallments: [1],
    buyer: {
      id: a.id,
      name: a.ad,
      surname: a.soyad,
      identityNumber: a.kimlikNo,
      email: a.eposta,
      gsmNumber: a.telefon,
      registrationAddress: a.adres,
      city: a.il,
      country: "Turkey",
      ip: a.ip,
    },
    billingAddress: {
      contactName: `${a.ad} ${a.soyad}`.trim(),
      city: a.il,
      country: "Turkey",
      address: a.adres,
    },
    basketItems: [
      {
        id: girdi.urunId,
        name: girdi.urunAdi,
        category1: "Abonelik",
        itemType: "VIRTUAL",
        price: fiyat,
      },
    ],
  };

  try {
    const res = await iyzicoPost(cfg, PATH_INITIALIZE, body);
    if (res.status !== "success" || typeof res.paymentPageUrl !== "string" || typeof res.token !== "string") {
      const hata = typeof res.errorMessage === "string" ? res.errorMessage : "Ödeme sayfası açılamadı.";
      return { ok: false, error: hata };
    }
    return { ok: true, token: res.token, paymentPageUrl: res.paymentPageUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "İyzico bağlantı hatası." };
  }
}

export type CheckoutSonuc = {
  status: string;
  paymentStatus: string | null;
  paymentId: string | null;
  paidPrice: string | null;
  currency: string | null;
  basketId: string | null;
  conversationId: string | null;
  fraudStatus: number | null;
  errorMessage: string | null;
};

export async function iyzicoCheckoutSonucu(
  token: string,
  conversationId: string
): Promise<{ ok: true; sonuc: CheckoutSonuc } | { ok: false; error: string }> {
  const cfg = getIyzicoConfig();
  if (!cfg) return { ok: false, error: "İyzico yapılandırması eksik." };

  try {
    const res = await iyzicoPost(cfg, PATH_RETRIEVE, { locale: "tr", conversationId, token });
    const str = (v: unknown) => (v === undefined || v === null ? null : String(v));
    return {
      ok: true,
      sonuc: {
        status: String(res.status ?? ""),
        paymentStatus: str(res.paymentStatus),
        paymentId: str(res.paymentId),
        paidPrice: str(res.paidPrice),
        currency: str(res.currency),
        basketId: str(res.basketId),
        conversationId: str(res.conversationId),
        fraudStatus: typeof res.fraudStatus === "number" ? res.fraudStatus : null,
        errorMessage: str(res.errorMessage),
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "İyzico bağlantı hatası." };
  }
}
