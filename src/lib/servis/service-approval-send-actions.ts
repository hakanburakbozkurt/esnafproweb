"use server";

import {
  buildServiceApprovalPayload,
  buildServiceApprovalUrl,
} from "@/lib/servis/approval-link";
import { sendServiceApprovalWhatsApp } from "@/lib/servis/whatsapp-notification";
import { createClient } from "@/lib/supabase/server";

export type SendServiceApprovalLinkResult =
  | {
      ok: true;
      lookupToken: string;
      approvalUrl: string;
      whatsappSent: boolean;
      warning?: string;
    }
  | {
      ok: false;
      error: string;
    };

type ApprovalLookupRpcRow = {
  id: string;
  service_id: string | null;
  approval_token: string | null;
  lookup_token: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  device_info: string | null;
};

function parseApprovalLookupRpc(raw: unknown): ApprovalLookupRpcRow | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;
  const id = typeof data.id === "string" ? data.id : null;
  if (!id) return null;

  return {
    id,
    service_id: typeof data.service_id === "string" ? data.service_id : null,
    approval_token:
      typeof data.approval_token === "string" ? data.approval_token : null,
    lookup_token:
      typeof data.lookup_token === "string" ? data.lookup_token : null,
    customer_name:
      typeof data.customer_name === "string" ? data.customer_name : null,
    customer_phone:
      typeof data.customer_phone === "string" ? data.customer_phone : null,
    device_info: typeof data.device_info === "string" ? data.device_info : null,
  };
}

/**
 * DB'deki gerçek approval_token / service_id ile onay linki üretir ve isteğe bağlı WhatsApp gönderir.
 * Harici uygulamalar da aynı RPC'yi (`get_technical_service_approval_lookup`) çağırmalıdır.
 */
export async function sendServiceApprovalLink(
  technicalServiceId: string,
  options?: { sendWhatsApp?: boolean }
): Promise<SendServiceApprovalLinkResult> {
  const trimmedId = technicalServiceId.trim();
  if (!trimmedId) {
    return { ok: false, error: "Servis kaydı seçilmedi." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Bu işlem için giriş yapmanız gerekiyor." };
    }

    const shouldSendWhatsApp = options?.sendWhatsApp !== false;

    const { data, error } = await supabase.rpc(
      "get_technical_service_approval_lookup",
      {
        p_technical_service_id: trimmedId,
        p_mark_sent: shouldSendWhatsApp,
      }
    );

    if (error) {
      console.error("[servis-onay] get_technical_service_approval_lookup:", {
        message: error.message,
        code: error.code,
        technicalServiceId: trimmedId,
      });

      if (error.message.includes("bulunamadı")) {
        return { ok: false, error: "Servis kaydı bulunamadı." };
      }

      if (error.message.includes("erişim yetkiniz yok")) {
        return { ok: false, error: "Bu servis kaydına erişim yetkiniz yok." };
      }

      return {
        ok: false,
        error: "Onay bağlantısı oluşturulamadı. Lütfen tekrar deneyin.",
      };
    }

    const record = parseApprovalLookupRpc(data);
    if (!record) {
      return {
        ok: false,
        error: "Onay bağlantısı yanıtı okunamadı.",
      };
    }

    const payload =
      buildServiceApprovalPayload(record) ??
      (record.lookup_token
        ? {
            lookupToken: record.lookup_token,
            approvalUrl: buildServiceApprovalUrl(record.lookup_token),
            message: "",
          }
        : null);

    if (!payload) {
      return {
        ok: false,
        error:
          "Onay bağlantısı oluşturulamadı. approval_token ve service_id boş.",
      };
    }

    console.info("[servis-onay] approval link prepared from DB", {
      technicalServiceId: record.id,
      serviceId: record.service_id,
      lookupTokenPrefix: payload.lookupToken.slice(0, 12),
      tokenSource:
        record.approval_token?.trim() === payload.lookupToken
          ? "approval_token"
          : record.service_id?.trim() === payload.lookupToken
            ? "service_id"
            : "fallback",
    });

    if (!shouldSendWhatsApp) {
      return {
        ok: true,
        lookupToken: payload.lookupToken,
        approvalUrl: payload.approvalUrl,
        whatsappSent: false,
      };
    }

    if (!record.customer_phone?.trim()) {
      return {
        ok: true,
        lookupToken: payload.lookupToken,
        approvalUrl: payload.approvalUrl,
        whatsappSent: false,
        warning:
          "Onay linki hazır; müşteri telefonu kayıtlı olmadığı için WhatsApp gönderilmedi.",
      };
    }

    const whatsappResult = await sendServiceApprovalWhatsApp(
      record.customer_phone,
      record
    );

    if (whatsappResult.error) {
      console.error("[servis-onay] approval WhatsApp failed:", whatsappResult.error);
      return {
        ok: true,
        lookupToken: payload.lookupToken,
        approvalUrl: payload.approvalUrl,
        whatsappSent: false,
        warning:
          "Onay linki oluşturuldu ancak WhatsApp gönderilemedi. Linki manuel paylaşın.",
      };
    }

    return {
      ok: true,
      lookupToken: payload.lookupToken,
      approvalUrl: payload.approvalUrl,
      whatsappSent: whatsappResult.sent,
      warning: whatsappResult.skipped
        ? "WhatsApp yapılandırması tanımlı değil; linki manuel paylaşın."
        : undefined,
    };
  } catch (err) {
    console.error("[servis-onay] sendServiceApprovalLink unexpected error", {
      err,
      technicalServiceId: trimmedId,
    });

    return {
      ok: false,
      error: err instanceof Error ? err.message : "Beklenmeyen hata",
    };
  }
}
