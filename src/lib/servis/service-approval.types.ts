export type ServiceApprovalStatus = "beklemede" | "onaylandi" | "reddedildi";

/** technical_service — public onay sayfası RPC yanıtı */
export type PublicServiceApprovalRecord = {
  id: string;
  service_id: string | null;
  store_id: string | null;
  customer_name: string;
  device_info: string;
  device_imei: string | null;
  status: string | null;
  approval_status: ServiceApprovalStatus;
  created_at: string | null;
  completed_at: string | null;
  fault_description: string | null;
  physical_checks: Record<string, unknown>;
  accessories: string[];
  approval_sent_at: string | null;
  terms_accepted_at: string | null;
  has_approval_token: boolean;
  tracking_code: string | null;
  token_expired: boolean;
  token_used: boolean;
};

export type ServiceApprovalActionState = {
  error?: string;
  success?: boolean;
  alreadyApproved?: boolean;
  trackingCode?: string;
  warning?: string;
};

export type ServiceApprovalRpcResult = {
  approval_status?: string;
  terms_accepted_at?: string | null;
  tracking_code?: string | null;
  customer_phone?: string | null;
  already?: boolean;
};
