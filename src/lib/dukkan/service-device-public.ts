import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type PublicServiceDevice =
  Database["public"]["Functions"]["get_service_device_public"]["Returns"][number];

type RpcClient = SupabaseClient<Database>;

export async function getPublicServiceDevice(
  supabase: RpcClient,
  deviceCode: string
): Promise<PublicServiceDevice | null> {
  const code = deviceCode.trim();
  if (!code) return null;

  const { data, error } = await supabase
    .rpc("get_service_device_public", { p_device_code: code })
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/** Vitrin QR/servis parametresi — cihaz bu dükkana ait değilse null döner. */
export async function getPublicServiceDeviceForDukkan(
  supabase: RpcClient,
  deviceCode: string,
  dukkan: { user_id: string; slug: string }
): Promise<PublicServiceDevice | null> {
  const device = await getPublicServiceDevice(supabase, deviceCode);
  if (!device) return null;

  const { data: store } = await supabase
    .from("stores")
    .select("owner_id, slug")
    .eq("id", device.store_id)
    .maybeSingle();

  if (
    !store ||
    store.owner_id !== dukkan.user_id ||
    store.slug !== dukkan.slug
  ) {
    return null;
  }

  return device;
}

export type PublicServiceStoreInfo = {
  dukkan_adi: string;
  slug: string;
  telefon: string | null;
  logo_url: string | null;
};

function parsePublicServiceStoreInfo(raw: unknown): PublicServiceStoreInfo | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;
  const dukkanAdi =
    typeof data.dukkan_adi === "string" ? data.dukkan_adi.trim() : "";
  const slug = typeof data.slug === "string" ? data.slug.trim() : "";

  if (!dukkanAdi || !slug) return null;

  const logoUrl =
    typeof data.logo_url === "string" && data.logo_url.trim()
      ? data.logo_url.trim()
      : null;

  return {
    dukkan_adi: dukkanAdi,
    slug,
    telefon: typeof data.telefon === "string" ? data.telefon : null,
    logo_url: logoUrl,
  };
}

/** Servis takip/onay sayfası mağaza kartı — RPC ile logo_url dahil. */
export async function getPublicServiceStoreInfo(
  supabase: RpcClient,
  storeId: string
): Promise<PublicServiceStoreInfo | null> {
  const trimmedId = storeId.trim();
  if (!trimmedId) return null;

  const { data, error } = await supabase.rpc("get_public_service_store_info", {
    p_store_id: trimmedId,
  });

  if (!error && data) {
    const parsed = parsePublicServiceStoreInfo(data);
    if (parsed) return parsed;
  }

  if (error) {
    console.error("[servis] get_public_service_store_info RPC:", error.message);
  }

  const { data: store } = await supabase
    .from("stores")
    .select("name, slug, owner_id")
    .eq("id", trimmedId)
    .maybeSingle();

  if (!store) return null;

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("dukkan_adi, slug, telefon, logo_url")
    .eq("user_id", store.owner_id)
    .maybeSingle();

  if (dukkan) {
    return {
      dukkan_adi: dukkan.dukkan_adi,
      slug: dukkan.slug,
      telefon: dukkan.telefon,
      logo_url: dukkan.logo_url?.trim() ? dukkan.logo_url.trim() : null,
    };
  }

  return {
    dukkan_adi: store.name,
    slug: store.slug,
    telefon: null,
    logo_url: null,
  };
}
