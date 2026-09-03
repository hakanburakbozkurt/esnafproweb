type SearchParamValue = string | string[] | undefined;

/** URL'den okunan onay tanımlayıcı parametreleri (öncelik sırasıyla). */
export const APPROVAL_URL_PARAM_KEYS = [
  "token",
  "approval_token",
  "approvalToken",
  "id",
  "service_id",
] as const;

function firstParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/** apr-..., SRV-..., UUID veya 8 haneli takip kodu gibi değerleri doğrular. */
export function isPlausibleApprovalLookupValue(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 6) return false;

  if (/^apr-[a-z0-9-]+$/i.test(trimmed)) return true;
  if (/^SRV-\d{4}-\d+$/i.test(trimmed)) return true;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed
    )
  ) {
    return true;
  }
  if (/^\d{8}$/.test(trimmed)) return true;

  return trimmed.length >= 8;
}

/** URL / WhatsApp linklerinden onay token'ını güvenli şekilde çıkarır. */
export function normalizeApprovalToken(raw: string): string {
  let token = raw.trim();

  if (!token) return "";

  try {
    token = decodeURIComponent(token).trim();
  } catch {
    // Olduğu gibi devam et
  }

  token = token.replace(/\s+/g, "");

  const looksLikeQueryString =
    token.includes("token=") ||
    token.includes("approval_token=") ||
    token.includes("id=") ||
    token.includes("service_id=");

  if (looksLikeQueryString) {
    try {
      const parseTarget = token.startsWith("http")
        ? token
        : `https://placeholder.local/?${token.replace(/^\?/, "")}`;
      const url = new URL(parseTarget);

      for (const key of APPROVAL_URL_PARAM_KEYS) {
        const fromUrl = url.searchParams.get(key);
        if (fromUrl?.trim()) {
          token = fromUrl.trim();
          break;
        }
      }
    } catch {
      // Olduğu gibi devam et
    }
  }

  return token.trim();
}

export type ApprovalSearchParams = Partial<
  Record<(typeof APPROVAL_URL_PARAM_KEYS)[number], SearchParamValue>
>;

export function extractApprovalTokenFromSearchParams(
  params: ApprovalSearchParams
): string {
  for (const key of APPROVAL_URL_PARAM_KEYS) {
    const candidate = firstParam(params[key]);
    if (!candidate) continue;

    const normalized = normalizeApprovalToken(candidate);
    if (isPlausibleApprovalLookupValue(normalized)) {
      return normalized;
    }
  }

  return "";
}
