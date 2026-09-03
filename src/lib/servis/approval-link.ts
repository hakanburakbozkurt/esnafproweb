import { getPublicSiteUrl } from "@/lib/auth/site-url";

export type TechnicalServiceApprovalIdentifiers = {
  id?: string | null;
  approval_token?: string | null;
  service_id?: string | null;
};

/** Onay sayfası lookup parametresi — öncelik: approval_token → service_id → kayıt id */
export function resolveApprovalLookupToken(
  record: TechnicalServiceApprovalIdentifiers
): string | null {
  const approvalToken = record.approval_token?.trim();
  if (approvalToken) return approvalToken;

  const serviceId = record.service_id?.trim();
  if (serviceId) return serviceId;

  const id = record.id?.trim();
  if (id) return id;

  return null;
}

export function buildServiceApprovalPath(lookupToken: string): string {
  return `/servis-onay?token=${encodeURIComponent(lookupToken)}`;
}

export function buildServiceApprovalUrl(
  lookupToken: string,
  siteUrl?: string
): string {
  const base = (siteUrl ?? getPublicSiteUrl()).replace(/\/$/, "");
  return `${base}${buildServiceApprovalPath(lookupToken)}`;
}

export function buildServiceApprovalMessage({
  customerName,
  deviceInfo,
  approvalUrl,
}: {
  customerName?: string | null;
  deviceInfo?: string | null;
  approvalUrl: string;
}): string {
  const name = customerName?.trim() || "Merhaba";
  const device = deviceInfo?.trim();

  const lines = [
    `${name}, teknik servis kaydınız oluşturuldu.`,
    device ? `Cihaz: ${device}` : null,
    "Servis şartlarını onaylamak için aşağıdaki bağlantıyı kullanın:",
    approvalUrl,
  ].filter((line): line is string => Boolean(line));

  return lines.join("\n");
}

export function buildServiceApprovalPayload(
  record: TechnicalServiceApprovalIdentifiers & {
    customer_name?: string | null;
    device_info?: string | null;
  },
  siteUrl?: string
): { lookupToken: string; approvalUrl: string; message: string } | null {
  const lookupToken = resolveApprovalLookupToken(record);
  if (!lookupToken) return null;

  const approvalUrl = buildServiceApprovalUrl(lookupToken, siteUrl);

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
