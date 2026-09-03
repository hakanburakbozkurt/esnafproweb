/** technical_service — dükkan sahibi yönetim paneli satır tipi */
export type TechnicalServiceRecord = {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  secondary_phone: string | null;
  device_info: string;
  device_imei: string | null;
  device_password: string | null;
  lock_type: string | null;
  pattern_lock_data: string | null;
  fault_description: string | null;
  cosmetic_notes: string | null;
  technician_name: string | null;
  status: string | null;
  approval_status: string;
  price: number | null;
  cost_price: number | null;
  deposit_amount: number | null;
  created_at: string;
  completed_at: string | null;
  photo_front_url: string | null;
  photo_back_url: string | null;
  photo_bottom_url: string | null;
  device_photo_urls: string[] | null;
  service_id: string | null;
  physical_checks: Record<string, unknown>;
  accessories: string[];
  tracking_code: string | null;
  approval_sent_at: string | null;
  terms_accepted_at: string | null;
};

export type TechnicalServiceListItem = Pick<
  TechnicalServiceRecord,
  | "id"
  | "created_at"
  | "customer_name"
  | "customer_phone"
  | "device_info"
  | "device_imei"
  | "status"
  | "technician_name"
  | "service_id"
  | "tracking_code"
  | "approval_status"
>;

export type TechnicalServiceSearchFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type TechnicalServiceSearchResult =
  | { ok: true; records: TechnicalServiceListItem[] }
  | { ok: false; error: string };

export type TechnicalServiceDetailResult =
  | { ok: true; record: TechnicalServiceRecord }
  | { ok: false; error: string };
