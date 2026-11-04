import { createHmac, randomBytes } from "node:crypto";

/** İyzico / iyzipay-node formatPrice ile uyumlu: 249 → "249.0", 249.5 → "249.5" */
export function formatIyzicoPrice(price: number): string {
  const result = parseFloat(String(price)).toString();
  return result.includes(".") ? result : `${result}.0`;
}

export function generateIyzicoRandomKey(): string {
  return `${Date.now()}${randomBytes(6).toString("hex")}`;
}

/**
 * IYZWSv2 imzası: HMAC-SHA256(randomKey + uriPath + body, secretKey) → hex;
 * Authorization = "IYZWSv2 " + base64("apiKey:..&randomKey:..&signature:..").
 * body, HTTP ile gönderilen JSON metninin birebir aynısı olmalıdır.
 */
export function buildIyzicoAuthorization(
  apiKey: string,
  secretKey: string,
  uriPath: string,
  body: string,
  randomKey: string
): string {
  const signature = createHmac("sha256", secretKey)
    .update(randomKey + uriPath + body, "utf8")
    .digest("hex");
  const plain = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;
  return `IYZWSv2 ${Buffer.from(plain, "utf8").toString("base64")}`;
}

const TR_MAP: Record<string, string> = {
  ğ: "g", Ğ: "G", ü: "u", Ü: "U", ş: "s", Ş: "S", ı: "i", İ: "I", ö: "o", Ö: "O", ç: "c", Ç: "C",
};

/** İyzico bazı alanlarda sade karakter bekler */
export function sanitizeIyzicoText(value: string, maxLen: number): string {
  let s = value.trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  s = s.replace(/./g, (ch) => TR_MAP[ch] ?? ch);
  s = s.replace(/[^\w\s\-'.@:/,]/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return "-";
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}
