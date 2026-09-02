import { createPublicClient } from "@/lib/supabase/public";
import { normalizeApprovalToken } from "@/lib/servis/approval-token";
import type { PublicServiceApprovalRecord } from "@/lib/servis/service-approval.types";

export type ServiceApprovalLookupResult =
  | { ok: true; record: PublicServiceApprovalRecord }
  | {
      ok: false;
      reason:
        | "missing_token"
        | "rpc_error"
        | "not_found"
        | "parse_failed"
        | "unexpected";
      message: string;
      debug?: Record<string, unknown>;
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

export async function lookupServiceApprovalByToken(
  rawToken: string
): Promise<ServiceApprovalLookupResult> {
  const token = normalizeApprovalToken(rawToken);

  if (token.length < 8) {
    return {
      ok: false,
      reason: "missing_token",
      message: "Onay bağlantısında geçerli bir token bulunamadı.",
      debug: { tokenLength: token.length },
    };
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("get_technical_service_public", {
      p_token: token,
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

      return {
        ok: false,
        reason: "rpc_error",
        message: error.message,
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
      });

      return {
        ok: false,
        reason: "not_found",
        message: "technical_service tablosunda eşleşen approval_token bulunamadı.",
        debug: { rowCount: 0 },
      };
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

      return {
        ok: false,
        reason: "parse_failed",
        message: "Servis kaydı bulundu ancak zorunlu alanlar eksik.",
        debug: parsed.debug,
      };
    }

    return { ok: true, record: parsed.record };
  } catch (err) {
    console.error("[servis-onay] lookupServiceApprovalByToken unexpected error", {
      err,
      tokenPrefix: token.slice(0, 12),
    });

    return {
      ok: false,
      reason: "unexpected",
      message: err instanceof Error ? err.message : "Beklenmeyen hata",
    };
  }
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
  return Object.entries(checks)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      const label = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return `${label}: ${String(value)}`;
    });
}
