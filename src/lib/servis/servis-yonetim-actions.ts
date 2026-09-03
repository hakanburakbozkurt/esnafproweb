"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveStrictDateRangeBounds } from "@/lib/servis/servis-yonetim-utils";
import type {
  TechnicalServiceDetailResult,
  TechnicalServiceListItem,
  TechnicalServiceRecord,
  TechnicalServiceSearchFilters,
  TechnicalServiceSearchResult,
} from "@/lib/servis/technical-service.types";

const LIST_SELECT =
  "id, created_at, customer_name, customer_phone, device_info, device_imei, status, technician_name, service_id, tracking_code, approval_status";

const DETAIL_SELECT =
  "id, user_id, customer_name, customer_phone, secondary_phone, device_info, device_imei, device_password, lock_type, pattern_lock_data, fault_description, cosmetic_notes, technician_name, status, approval_status, price, cost_price, deposit_amount, created_at, completed_at, photo_front_url, photo_back_url, photo_bottom_url, device_photo_urls, service_id, physical_checks, accessories, tracking_code, approval_sent_at, terms_accepted_at";

function sanitizeSearchTerm(raw: string | undefined): string {
  return (raw ?? "").trim().slice(0, 120);
}

function parsePhysicalChecks(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function parseAccessories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function parseDevicePhotoUrls(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const urls = raw.filter((item): item is string => typeof item === "string");
  return urls.length > 0 ? urls : null;
}

function normalizeDetailRecord(raw: Record<string, unknown>): TechnicalServiceRecord {
  return {
    id: String(raw.id),
    user_id: typeof raw.user_id === "string" ? raw.user_id : null,
    customer_name: String(raw.customer_name ?? ""),
    customer_phone:
      typeof raw.customer_phone === "string" ? raw.customer_phone : null,
    secondary_phone:
      typeof raw.secondary_phone === "string" ? raw.secondary_phone : null,
    device_info: String(raw.device_info ?? ""),
    device_imei: typeof raw.device_imei === "string" ? raw.device_imei : null,
    device_password:
      typeof raw.device_password === "string" ? raw.device_password : null,
    lock_type: typeof raw.lock_type === "string" ? raw.lock_type : null,
    pattern_lock_data:
      typeof raw.pattern_lock_data === "string" ? raw.pattern_lock_data : null,
    fault_description:
      typeof raw.fault_description === "string" ? raw.fault_description : null,
    cosmetic_notes:
      typeof raw.cosmetic_notes === "string" ? raw.cosmetic_notes : null,
    technician_name:
      typeof raw.technician_name === "string" ? raw.technician_name : null,
    status: typeof raw.status === "string" ? raw.status : null,
    approval_status: String(raw.approval_status ?? "beklemede"),
    price: typeof raw.price === "number" ? raw.price : null,
    cost_price: typeof raw.cost_price === "number" ? raw.cost_price : null,
    deposit_amount:
      typeof raw.deposit_amount === "number" ? raw.deposit_amount : null,
    created_at: String(raw.created_at ?? ""),
    completed_at:
      typeof raw.completed_at === "string" ? raw.completed_at : null,
    photo_front_url:
      typeof raw.photo_front_url === "string" ? raw.photo_front_url : null,
    photo_back_url:
      typeof raw.photo_back_url === "string" ? raw.photo_back_url : null,
    photo_bottom_url:
      typeof raw.photo_bottom_url === "string" ? raw.photo_bottom_url : null,
    device_photo_urls: parseDevicePhotoUrls(raw.device_photo_urls),
    service_id: typeof raw.service_id === "string" ? raw.service_id : null,
    physical_checks: parsePhysicalChecks(raw.physical_checks),
    accessories: parseAccessories(raw.accessories),
    tracking_code:
      typeof raw.tracking_code === "string" ? raw.tracking_code : null,
    approval_sent_at:
      typeof raw.approval_sent_at === "string" ? raw.approval_sent_at : null,
    terms_accepted_at:
      typeof raw.terms_accepted_at === "string" ? raw.terms_accepted_at : null,
  };
}

async function requireShopOwnerUserId(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Bu işlem için giriş yapmalısınız." };
  }

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dukkan) {
    return { ok: false, error: "Servis kayıtları için önce mağaza açmalısınız." };
  }

  return { ok: true, userId: user.id };
}

export async function searchTechnicalServices(
  filters: TechnicalServiceSearchFilters = {}
): Promise<TechnicalServiceSearchResult> {
  const auth = await requireShopOwnerUserId();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const range = resolveStrictDateRangeBounds(filters.dateFrom, filters.dateTo);
  if ("error" in range && range.error) {
    return { ok: false, error: range.error };
  }

  const search = sanitizeSearchTerm(filters.search);

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("technical_service")
      .select(LIST_SELECT)
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (range.startIso) {
      query = query.gte("created_at", range.startIso);
    }
    if (range.endIso) {
      query = query.lte("created_at", range.endIso);
    }

    if (search) {
      const escaped = search.replace(/[%_,]/g, "");
      const term = `%${escaped}%`;
      query = query.or(
        `customer_name.ilike.${term},customer_phone.ilike.${term},device_info.ilike.${term}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("[servis-yonetim] searchTechnicalServices:", error.message);
      return {
        ok: false,
        error: "Servis kayıtları yüklenemedi. Lütfen tekrar deneyin.",
      };
    }

    return { ok: true, records: (data ?? []) as TechnicalServiceListItem[] };
  } catch (err) {
    console.error("[servis-yonetim] searchTechnicalServices unexpected error", {
      err,
    });
    return {
      ok: false,
      error: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}

export async function getTechnicalServiceDetail(
  serviceId: string
): Promise<TechnicalServiceDetailResult> {
  const trimmedId = serviceId.trim();
  if (!trimmedId) {
    return { ok: false, error: "Geçersiz servis kaydı." };
  }

  const auth = await requireShopOwnerUserId();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("technical_service")
      .select(DETAIL_SELECT)
      .eq("id", trimmedId)
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (error) {
      console.error("[servis-yonetim] getTechnicalServiceDetail:", error.message);
      return {
        ok: false,
        error: "Servis detayı yüklenemedi. Lütfen tekrar deneyin.",
      };
    }

    if (!data) {
      return { ok: false, error: "Servis kaydı bulunamadı veya erişim yetkiniz yok." };
    }

    return {
      ok: true,
      record: normalizeDetailRecord(data as Record<string, unknown>),
    };
  } catch (err) {
    console.error("[servis-yonetim] getTechnicalServiceDetail unexpected error", {
      err,
    });
    return {
      ok: false,
      error: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}
