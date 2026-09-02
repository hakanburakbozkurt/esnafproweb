type SearchParamValue = string | string[] | undefined;

function firstParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
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

  if (token.includes("token=") || token.includes("approval_token=")) {
    try {
      const parseTarget = token.startsWith("http")
        ? token
        : `https://placeholder.local/?${token.replace(/^\?/, "")}`;
      const url = new URL(parseTarget);
      token =
        url.searchParams.get("token") ??
        url.searchParams.get("approval_token") ??
        url.searchParams.get("service_id") ??
        token;
    } catch {
      // Olduğu gibi devam et
    }
  }

  return token.trim();
}

export function extractApprovalTokenFromSearchParams(params: {
  token?: SearchParamValue;
  approval_token?: SearchParamValue;
  approvalToken?: SearchParamValue;
  service_id?: SearchParamValue;
}): string {
  const candidates = [
    firstParam(params.token),
    firstParam(params.approval_token),
    firstParam(params.approvalToken),
    firstParam(params.service_id),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeApprovalToken(candidate);
    if (normalized.length >= 6) {
      return normalized;
    }
  }

  return "";
}
