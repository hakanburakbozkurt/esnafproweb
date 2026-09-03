import "server-only";

import { normalizeWhatsAppNumber } from "@/lib/dukkan/contact";
import {
  buildServiceApprovalMessage,
  buildServiceApprovalUrl,
  resolveApprovalLookupToken,
} from "@/lib/servis/approval-link";

const TRACKING_MESSAGE_TEMPLATE =
  "Servis işleminiz başarıyla onaylanmıştır! Cihaz takip numaranız: {tracking_code}. Cihazınızın durumunu bu numara ile dilediğiniz zaman takip edebilirsiniz.";

export function buildServiceTrackingMessage(trackingCode: string): string {
  return TRACKING_MESSAGE_TEMPLATE.replace("{tracking_code}", trackingCode);
}

export type WhatsAppSendResult = {
  sent: boolean;
  skipped?: boolean;
  error?: string;
};

async function sendViaWhatsAppCloudApi(
  phone: string,
  message: string
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (!token || !phoneNumberId) {
    return { sent: false, skipped: true };
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      sent: false,
      error: `WhatsApp API ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  return { sent: true };
}

async function sendViaWebhook(
  phone: string,
  message: string,
  metadata: Record<string, string>
): Promise<WhatsAppSendResult> {
  const webhookUrl = process.env.WHATSAPP_NOTIFICATION_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return { sent: false, skipped: true };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      message,
      ...metadata,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      sent: false,
      error: `WhatsApp webhook ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  return { sent: true };
}

async function dispatchWhatsAppMessage(
  phone: string,
  message: string,
  metadata: Record<string, string>
): Promise<WhatsAppSendResult> {
  const cloudResult = await sendViaWhatsAppCloudApi(phone, message);
  if (cloudResult.sent || cloudResult.error) {
    return cloudResult;
  }

  const webhookResult = await sendViaWebhook(phone, message, metadata);
  if (webhookResult.sent || webhookResult.error) {
    return webhookResult;
  }

  console.warn(
    "[servis-onay] WhatsApp bildirimi atlandı: WHATSAPP_CLOUD_API_TOKEN veya WHATSAPP_NOTIFICATION_WEBHOOK_URL tanımlı değil."
  );
  return { sent: false, skipped: true };
}

export async function sendServiceTrackingWhatsApp(
  rawPhone: string,
  trackingCode: string
): Promise<WhatsAppSendResult> {
  const phone = normalizeWhatsAppNumber(rawPhone);

  if (!phone) {
    return { sent: false, error: "Geçersiz müşteri telefon numarası." };
  }

  const message = buildServiceTrackingMessage(trackingCode);

  try {
    return await dispatchWhatsAppMessage(phone, message, {
      tracking_code: trackingCode,
    });
  } catch (err) {
    console.error("[servis-onay] sendServiceTrackingWhatsApp unexpected error", {
      err,
    });
    return {
      sent: false,
      error: err instanceof Error ? err.message : "WhatsApp gönderimi başarısız.",
    };
  }
}

export type ServiceApprovalWhatsAppRecord = {
  id?: string | null;
  approval_token?: string | null;
  service_id?: string | null;
  customer_name?: string | null;
  device_info?: string | null;
};

export function buildServiceApprovalWhatsAppMessage(
  record: ServiceApprovalWhatsAppRecord
): { lookupToken: string; approvalUrl: string; message: string } | null {
  const lookupToken = resolveApprovalLookupToken(record);
  if (!lookupToken) return null;

  const approvalUrl = buildServiceApprovalUrl(lookupToken);

  return {
    lookupToken,
    approvalUrl,
    message: buildServiceApprovalMessage({
      customerName: record.customer_name,
      deviceInfo: record.device_info,
      approvalUrl,
    }),
  };
}

export async function sendServiceApprovalWhatsApp(
  rawPhone: string,
  record: ServiceApprovalWhatsAppRecord
): Promise<
  WhatsAppSendResult & {
    lookupToken?: string;
    approvalUrl?: string;
  }
> {
  const phone = normalizeWhatsAppNumber(rawPhone);

  if (!phone) {
    return { sent: false, error: "Geçersiz müşteri telefon numarası." };
  }

  const payload = buildServiceApprovalWhatsAppMessage(record);
  if (!payload) {
    return {
      sent: false,
      error:
        "Onay bağlantısı oluşturulamadı. Servis kaydında approval_token veya service_id bulunamadı.",
    };
  }

  try {
    const result = await dispatchWhatsAppMessage(phone, payload.message, {
      lookup_token: payload.lookupToken,
      approval_url: payload.approvalUrl,
      service_id: record.service_id?.trim() ?? "",
      approval_token: record.approval_token?.trim() ?? "",
    });

    return {
      ...result,
      lookupToken: payload.lookupToken,
      approvalUrl: payload.approvalUrl,
    };
  } catch (err) {
    console.error("[servis-onay] sendServiceApprovalWhatsApp unexpected error", {
      err,
    });
    return {
      sent: false,
      error: err instanceof Error ? err.message : "WhatsApp gönderimi başarısız.",
    };
  }
}
