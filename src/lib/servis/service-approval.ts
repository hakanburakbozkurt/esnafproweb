import { createPublicClient } from "@/lib/supabase/public";
import {
  isAprFormatApprovalToken,
  isPlausibleApprovalLookupValue,
  isServiceIdApprovalToken,
  normalizeApprovalToken,
} from "@/lib/servis/approval-token";
import type { PublicServiceApprovalRecord } from "@/lib/servis/service-approval.types";

export type ServiceApprovalLookupFailureReason =
  | "missing_token"
  | "rpc_error"
  | "not_found"
  | "orphan_apr_token"
  | "orphan_service_id"
  | "parse_failed"
  | "unexpected";

export type ServiceApprovalLookupResult =
  | { ok: true; record: PublicServiceApprovalRecord; matchedToken: string }
  | {
      ok: false;
      reason: ServiceApprovalLookupFailureReason;
      message: string;
      userMessage: string;
      debug?: Record<string, unknown>;
      attemptedTokens?: string[];
    };

function parsePublicServiceRecord(
  raw: unknown
): { record: PublicServiceApprovalRecord | null; debug?: Record<string, unknown> } {
  if (raw === null || raw === undefined) {
    return { record: null, debug: { cause: "rpc_returned_null" } };
  }

  if (typeof raw !== "object") {
    return {
      record: null,
      debug: { cause: "unexpected_payload_type", payloadType: typeof raw },
    };
  }

  const data = raw as Record<string, unknown>;
  const id =
    typeof data.id === "string"
      ? data.id
      : data.id != null
        ? String(data.id)
        : null;
  const customerName =
    typeof data.customer_name === "string" ? data.customer_name.trim() : "";
  const deviceInfo =
    typeof data.device_info === "string" ? data.device_info.trim() : "";

  if (!id || !customerName || !deviceInfo) {
    return {
      record: null,
      debug: {
        cause: "required_fields_missing",
        hasId: Boolean(id),
        hasCustomerName: Boolean(customerName),
        hasDeviceInfo: Boolean(deviceInfo),
      },
    };
  }

  const approvalStatus = String(data.approval_status ?? "beklemede");
  const normalizedApproval =
    approvalStatus === "onaylandi" || approvalStatus === "reddedildi"
      ? approvalStatus
      : "beklemede";

  const accessories = Array.isArray(data.accessories)
    ? data.accessories.filter((item): item is string => typeof item === "string")
    : [];

  const physicalChecks =
    data.physical_checks &&
    typeof data.physical_checks === "object" &&
    !Array.isArray(data.physical_checks)
      ? (data.physical_checks as Record<string, unknown>)
      : {};

  return {
    record: {
      id,
    service_id:
      typeof data.service_id === "string" ? data.service_id : null,
    store_id: typeof data.store_id === "string" ? data.store_id : null,
    customer_name: customerName,
      device_info: deviceInfo,
      device_imei:
        typeof data.device_imei === "string" ? data.device_imei : null,
      status: typeof data.status === "string" ? data.status : null,
      approval_status: normalizedApproval,
      created_at:
        typeof data.created_at === "string" ? data.created_at : null,
      completed_at:
        typeof data.completed_at === "string" ? data.completed_at : null,
      fault_description:
        typeof data.fault_description === "string"
          ? data.fault_description
          : null,
      cosmetic_notes:
        typeof data.cosmetic_notes === "string" ? data.cosmetic_notes : null,
      lock_type: typeof data.lock_type === "string" ? data.lock_type : null,
      device_password:
        typeof data.device_password === "string" ? data.device_password : null,
      pattern_lock_data:
        typeof data.pattern_lock_data === "string"
          ? data.pattern_lock_data
          : null,
      physical_checks: physicalChecks,
      accessories,
      approval_sent_at:
        typeof data.approval_sent_at === "string"
          ? data.approval_sent_at
          : null,
      terms_accepted_at:
        typeof data.terms_accepted_at === "string"
          ? data.terms_accepted_at
          : null,
      has_approval_token: data.has_approval_token === true,
      tracking_code:
        typeof data.tracking_code === "string" ? data.tracking_code : null,
      token_expired: data.token_expired === true,
      token_used: data.token_used === true,
    },
  };
}

function buildLookupFailureUserMessage(
  reason: ServiceApprovalLookupFailureReason,
  primaryToken?: string
): string {
  switch (reason) {
    case "missing_token":
      return "Onay bağlantısında geçerli bir kod bulunamadı. Size gönderilen orijinal linki kullanın.";
    case "orphan_apr_token":
      return "Bu onay kodu sistemde kayıtlı değil. Link, servis kaydı oluşturulmadan paylaşılmış olabilir. Servis noktanızdan güncel onay bağlantısını isteyin.";
    case "orphan_service_id":
      return "Bu servis numarasına ait onay kaydı bulunamadı. Servis noktanızla iletişime geçerek güncel bağlantıyı talep edin.";
    case "rpc_error":
      return "Onay kaydı şu an sorgulanamıyor. Lütfen birkaç dakika sonra tekrar deneyin.";
    case "parse_failed":
      return "Onay kaydı bulundu ancak görüntülenemedi. Servis noktanızla iletişime geçin.";
    case "unexpected":
      return "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    case "not_found":
    default:
      if (primaryToken && /^\d{8}$/.test(primaryToken)) {
        return "Bu takip kodu için onay kaydı bulunamadı. Onay linki yerine servis takip sayfasını deneyebilirsiniz.";
      }
      return "Bu onay bağlantısı geçersiz, eksik veya süresi dolmuş olabilir. Size gönderilen orijinal bağlantıyı kullanın veya servis noktanızla iletişime geçin.";
  }
}

function refineNotFoundReason(
  token: string,
  base: Extract<ServiceApprovalLookupResult, { ok: false }>
): Extract<ServiceApprovalLookupResult, { ok: false }> {
  if (base.reason !== "not_found") {
    return base;
  }

  if (isAprFormatApprovalToken(token)) {
    return {
      ...base,
      reason: "orphan_apr_token",
      message:
        "apr- formatındaki token technical_service tablosunda bulunamadı (client-side üretilmiş olabilir).",
      userMessage: buildLookupFailureUserMessage("orphan_apr_token", token),
    };
  }

  if (isServiceIdApprovalToken(token)) {
    return {
      ...base,
      reason: "orphan_service_id",
      message: "service_id technical_service tablosunda bulunamadı.",
      userMessage: buildLookupFailureUserMessage("orphan_service_id", token),
    };
  }

  return {
    ...base,
    userMessage: buildLookupFailureUserMessage("not_found", token),
  };
}

export async function lookupServiceApprovalByToken(
  rawToken: string
): Promise<ServiceApprovalLookupResult> {
  const token = normalizeApprovalToken(rawToken);

  if (!isPlausibleApprovalLookupValue(token)) {
    const reason = "missing_token" as const;
    return {
      ok: false,
      reason,
      message: "Onay bağlantısında geçerli bir token bulunamadı.",
      userMessage: buildLookupFailureUserMessage(reason),
      debug: { tokenLength: token.length },
    };
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("get_technical_service_public", {
      p_token: token,
      p_service_id: token,
    });

    if (error) {
      console.error("[servis-onay] get_technical_service_public RPC error", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        tokenPrefix: token.slice(0, 12),
        tokenLength: token.length,
      });

      const reason = "rpc_error" as const;
      return {
        ok: false,
        reason,
        message: error.message,
        userMessage: buildLookupFailureUserMessage(reason),
        debug: {
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
      };
    }

    if (data === null) {
      console.warn("[servis-onay] RPC returned zero rows for token", {
        tokenPrefix: token.slice(0, 12),
        tokenLength: token.length,
        isAprFormat: isAprFormatApprovalToken(token),
      });

      return refineNotFoundReason(token, {
        ok: false,
        reason: "not_found",
        message:
          "technical_service tablosunda eşleşen kayıt bulunamadı (approval_token / service_id / tracking_code).",
        userMessage: buildLookupFailureUserMessage("not_found", token),
        debug: { rowCount: 0 },
      });
    }

    const parsed = parsePublicServiceRecord(data);

    if (!parsed.record) {
      console.error("[servis-onay] RPC yanıtı parse edilemedi", {
        tokenPrefix: token.slice(0, 12),
        debug: parsed.debug,
        payloadKeys:
          data && typeof data === "object"
            ? Object.keys(data as Record<string, unknown>)
            : [],
      });

      const reason = "parse_failed" as const;
      return {
        ok: false,
        reason,
        message: "Servis kaydı bulundu ancak zorunlu alanlar eksik.",
        userMessage: buildLookupFailureUserMessage(reason),
        debug: parsed.debug,
      };
    }

    return { ok: true, record: parsed.record, matchedToken: token };
  } catch (err) {
    console.error("[servis-onay] lookupServiceApprovalByToken unexpected error", {
      err,
      tokenPrefix: token.slice(0, 12),
    });

    const reason = "unexpected" as const;
    return {
      ok: false,
      reason,
      message: err instanceof Error ? err.message : "Beklenmeyen hata",
      userMessage: buildLookupFailureUserMessage(reason),
    };
  }
}

/** Birincil token başarısız olursa URL'deki diğer adayları dener (token, id, service_id). */
export async function lookupServiceApprovalByCandidates(
  candidates: string[]
): Promise<ServiceApprovalLookupResult> {
  const normalized = [
    ...new Set(
      candidates
        .map((candidate) => normalizeApprovalToken(candidate))
        .filter(isPlausibleApprovalLookupValue)
    ),
  ];

  if (normalized.length === 0) {
    const reason = "missing_token" as const;
    return {
      ok: false,
      reason,
      message: "Onay bağlantısında geçerli bir token bulunamadı.",
      userMessage: buildLookupFailureUserMessage(reason),
    };
  }

  let lastFailure: Extract<ServiceApprovalLookupResult, { ok: false }> | null =
    null;

  for (const token of normalized) {
    const result = await lookupServiceApprovalByToken(token);
    if (result.ok) {
      return result;
    }
    lastFailure = result;
  }

  return (
    lastFailure ?? {
      ok: false,
      reason: "not_found",
      message: "Onay kaydı bulunamadı.",
      userMessage: buildLookupFailureUserMessage("not_found"),
      attemptedTokens: normalized,
    }
  );
}

export async function getServiceApprovalByToken(
  token: string
): Promise<PublicServiceApprovalRecord | null> {
  const result = await lookupServiceApprovalByToken(token);
  return result.ok ? result.record : null;
}

export function formatPhysicalChecks(
  checks: Record<string, unknown>
): string[] {
  return parsePhysicalChecks(checks).map((item) => item.label);
}

const PHYSICAL_CHECK_LABELS: Record<string, string> = {
  on_ekran: "Ön Ekran",
  arka_kasa: "Arka Kasa",
  cerceve: "Çerçeve",
  su_hasari: "Su Hasarı",
  yan_tuslar: "Yan Tuşlar",
  kamera_cami: "Kamera Camı",
};

export type PhysicalCheckItem = {
  key: string;
  label: string;
  /** true = teknisyen kontrol etti, false = bakılmadı */
  checked: boolean;
};

function formatPhysicalCheckLabel(key: string): string {
  if (PHYSICAL_CHECK_LABELS[key]) {
    return PHYSICAL_CHECK_LABELS[key];
  }

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return null;
}

export function parsePhysicalChecks(
  checks: Record<string, unknown>
): PhysicalCheckItem[] {
  return Object.keys(PHYSICAL_CHECK_LABELS).map((key) => ({
    key,
    label: formatPhysicalCheckLabel(key),
    checked: coerceBoolean(checks[key]) === true,
  }));
}

export type LockDisplayInfo = {
  label: string;
  value: string;
};

const LOCK_TYPE_LABELS: Record<string, string> = {
  pin: "Kilit / PIN:",
  password: "Kilit / Şifre:",
  sifre: "Kilit / Şifre:",
  pattern: "Kilit / Desen:",
  desen: "Kilit / Desen:",
};

export function formatLockDisplay(
  lockType: string | null | undefined,
  devicePassword: string | null | undefined,
  patternLockData: string | null | undefined
): LockDisplayInfo | null {
  const normalizedType = lockType?.trim().toLowerCase() ?? "";
  const password = devicePassword?.trim() ?? "";
  const pattern = patternLockData?.trim() ?? "";

  if (normalizedType === "pattern" || normalizedType === "desen") {
    if (!pattern) return null;
    return {
      label: LOCK_TYPE_LABELS[normalizedType] ?? "Kilit / Desen:",
      value: pattern,
    };
  }

  if (password) {
    return {
      label:
        LOCK_TYPE_LABELS[normalizedType] ??
        (normalizedType === "pin" ? "Kilit / PIN:" : "Kilit / Şifre:"),
      value: password,
    };
  }

  return null;
}

/** fault_description içine gömülü "— Kilit: ..." satırını ayırır */
export function parseEmbeddedLockFromFaultDescription(
  faultDescription: string
): { faultText: string; lock: LockDisplayInfo | null } {
  const text = faultDescription.trim();
  if (!text) return { faultText: "", lock: null };

  const match = text.match(
    /^(.*?)\s*[—–-]\s*Kilit:\s*(PIN|Şifre|Sifre|Desen)\s*:\s*(.+)$/i
  );

  if (!match) {
    return { faultText: text, lock: null };
  }

  const [, faultText, lockKind, lockValue] = match;
  const normalizedKind = lockKind.toLowerCase();

  let label = "Kilit / Şifre:";
  if (normalizedKind === "pin") label = "Kilit / PIN:";
  if (normalizedKind === "desen") label = "Kilit / Desen:";

  return {
    faultText: faultText.trim(),
    lock: { label, value: lockValue.trim() },
  };
}

/** fault_description içine gömülü "— Kilit: ..." satırını ayırır */
export function stripEmbeddedLockFromFaultDescription(
  faultDescription: string,
  lock: LockDisplayInfo | null
): string {
  let text = faultDescription.trim();
  if (!text) return "";

  const embeddedLockMatch = text.match(/\s*[—–-]\s*Kilit:\s*.+$/i);
  if (embeddedLockMatch) {
    text = text.slice(0, embeddedLockMatch.index).trim();
  }

  if (lock && !embeddedLockMatch) {
    const lockValuePattern = lock.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const trailingLock = new RegExp(
      `\\s*[—–-]\\s*Kilit:\\s*(?:PIN|Şifre|Desen|Sifre)?\\s*:?\\s*${lockValuePattern}\\s*$`,
      "i"
    );
    text = text.replace(trailingLock, "").trim();
  }

  return text;
}
