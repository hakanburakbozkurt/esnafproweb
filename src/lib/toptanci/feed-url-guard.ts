import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Toptancı XML/JSON feed indirmesi için SSRF koruması.
 * - Yalnızca http(s), kullanıcı bilgisi yok.
 * - Host adı DNS ile çözülür; çözülen HER adres engelli aralıklara bakılır.
 * - Yönlendirmeler otomatik takip edilmez; her adım yeniden doğrulanır.
 * - Zaman aşımı ve yanıt boyutu sınırı vardır.
 */

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 10 * 1024 * 1024;

function ipv4Octets(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((p) => Number(p));
  if (octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) return null;
  return octets;
}

export function isBlockedIpv4(ip: string): boolean {
  const o = ipv4Octets(ip);
  if (!o) return true;
  const [a, b] = o;
  if (a === 0 || a === 10 || a === 127) return true; // bu ağ, özel, loopback
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 169 && b === 254) return true; // link-local (bulut metadata dahil)
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true; // multicast ve rezerve
  return false;
}

export function isBlockedIpv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  // IPv4-mapped (::ffff:a.b.c.d)
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIpv4(mapped[1]);
  // Unique local fc00::/7 ve link-local fe80::/10
  if (/^f[cd]/.test(v)) return true;
  if (/^fe[89ab]/.test(v)) return true;
  return false;
}

export function isBlockedAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isBlockedIpv4(ip);
  if (family === 6) return isBlockedIpv6(ip);
  return true; // IP değilse güvensiz say
}

export class FeedUrlError extends Error {}

/** URL söz dizimi ve host kontrolü; DNS çözümünden sonra tüm adresler denetlenir. */
export async function assertSafeFeedUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new FeedUrlError("Geçersiz feed URL adresi.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new FeedUrlError("Feed URL yalnızca http:// veya https:// ile başlayabilir.");
  }
  if (parsed.username || parsed.password) {
    throw new FeedUrlError("Feed URL kullanıcı adı veya şifre içeremez.");
  }

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new FeedUrlError("Feed URL dahili veya yerel ağ adreslerine işaret edemez.");
  }

  let addresses: string[];
  if (isIP(host)) {
    addresses = [host];
  } else {
    try {
      const results = await lookup(host, { all: true, verbatim: true });
      addresses = results.map((r) => r.address);
    } catch {
      throw new FeedUrlError("Feed adresi çözümlenemedi.");
    }
  }

  if (addresses.length === 0 || addresses.some(isBlockedAddress)) {
    throw new FeedUrlError("Feed URL dahili veya yerel ağ adreslerine işaret edemez.");
  }
  return parsed;
}

async function readLimited(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new FeedUrlError("Feed dosyası çok büyük (en fazla 10 MB).");
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(buf);
}

export async function fetchFeedTextSafely(url: string): Promise<string> {
  let current = await assertSafeFeedUrl(url);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res: Response;
    try {
      res = await fetch(current.toString(), {
        headers: { Accept: "application/json, application/xml, text/xml, text/plain, */*" },
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch {
      throw new FeedUrlError("Feed indirilemedi (zaman aşımı veya ağ hatası).");
    }

    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      if (hop === MAX_REDIRECTS) {
        throw new FeedUrlError("Feed çok fazla yönlendirme yaptı.");
      }
      const next = new URL(res.headers.get("location") as string, current);
      current = await assertSafeFeedUrl(next.toString());
      continue;
    }

    if (!res.ok) {
      throw new FeedUrlError(`Feed indirilemedi (HTTP ${res.status}).`);
    }
    const text = await readLimited(res);
    if (!text.trim()) {
      throw new FeedUrlError("Feed dosyası boş.");
    }
    return text;
  }
  throw new FeedUrlError("Feed indirilemedi.");
}
