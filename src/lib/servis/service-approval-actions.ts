"use server";

import { normalizeApprovalToken } from "@/lib/servis/approval-token";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  ServiceApprovalActionState,
  ServiceApprovalRpcResult,
} from "@/lib/servis/service-approval.types";
import { sendServiceTrackingWhatsApp } from "@/lib/servis/whatsapp-notification";

export async function approveServiceTerms(
  _prevState: ServiceApprovalActionState,
  formData: FormData
): Promise<ServiceApprovalActionState> {
  const token = normalizeApprovalToken(String(formData.get("token") ?? ""));

  if (token.length < 8) {
    return { error: "Geçersiz onay bağlantısı. Lütfen size gönderilen linki kullanın." };
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc(
      "respond_technical_service_approval",
      {
        p_token: token,
        p_decision: "onaylandi",
      }
    );

    if (error) {
      console.error("[servis-onay] respond_technical_service_approval:", error.message);

      if (error.message.includes("bulunamadı")) {
        return {
          error:
            "Bu onay bağlantısı geçersiz veya süresi dolmuş. Servis noktanızla iletişime geçin.",
        };
      }

      if (error.message.includes("süresi dolmuş")) {
        return {
          error:
            "Bu onay bağlantısının süresi dolmuş. Servis noktanızdan yeni bir onay linki isteyin.",
        };
      }

      if (error.message.includes("Mağaza kaydı")) {
        return {
          error:
            "Onay kaydedildi ancak takip kodu oluşturulamadı. Servis noktanızla iletişime geçin.",
        };
      }

      return {
        error:
          "Onay işlemi şu an tamamlanamadı. Lütfen birkaç dakika sonra tekrar deneyin.",
      };
    }

    const result = data as ServiceApprovalRpcResult | null;

    if (result?.approval_status !== "onaylandi") {
      return {
        error: "Onay kaydedilemedi. Lütfen servis noktanızla iletişime geçin.",
      };
    }

    const trackingCode = result.tracking_code?.trim() ?? "";
    const alreadyApproved = result.already === true;

    if (!trackingCode) {
      return {
        error:
          "Onay tamamlandı ancak takip kodu oluşturulamadı. Servis noktanızla iletişime geçin.",
      };
    }

    let warning: string | undefined;

    if (!alreadyApproved && result.customer_phone) {
      const whatsappResult = await sendServiceTrackingWhatsApp(
        result.customer_phone,
        trackingCode
      );

      if (whatsappResult.error) {
        console.error("[servis-onay] WhatsApp bildirimi başarısız:", whatsappResult.error);
        warning =
          "Onayınız kaydedildi ve takip kodunuz oluşturuldu; ancak WhatsApp bildirimi gönderilemedi. Takip kodunuzu aşağıdan not alabilirsiniz.";
      } else if (whatsappResult.skipped) {
        console.warn("[servis-onay] WhatsApp bildirimi yapılandırılmamış.");
      }
    }

    return {
      success: true,
      alreadyApproved,
      trackingCode,
      warning,
    };
  } catch (err) {
    console.error("[servis-onay] approveServiceTerms unexpected error", { err });
    return {
      error:
        "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    };
  }
}
