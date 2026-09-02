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

/** Servis takip sayfası mağaza kartı — stores → dukkanlar eşlemesi. */
export async function getPublicServiceStoreInfo(
  supabase: RpcClient,
  storeId: string
): Promise<PublicServiceStoreInfo | null> {
  const { data: store } = await supabase
    .from("stores")
    .select("name, slug, owner_id")
    .eq("id", storeId)
    .maybeSingle();

  if (!store) return null;

  const { data: dukkan } = await supabase
    .from("dukkanlar")
    .select("dukkan_adi, slug, telefon, logo_url")
    .eq("slug", store.slug)
    .maybeSingle();

  if (dukkan) {
    return {
      dukkan_adi: dukkan.dukkan_adi,
      slug: dukkan.slug,
      telefon: dukkan.telefon,
      logo_url: dukkan.logo_url,
    };
  }

  return {
    dukkan_adi: store.name,
    slug: store.slug,
    telefon: null,
    logo_url: null,
  };
}
