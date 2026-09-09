import {
  DEFAULT_FREE_ACTION_LIMIT,
  type ShopSubscriptionAdminRow,
  type ShopSubscriptionTier,
} from "@/lib/local-yonetim/subscriptions/types";
import { createClient } from "@/lib/supabase/server";

export type SubscriptionAdminQueryResult = {
  rows: ShopSubscriptionAdminRow[];
  error?: string;
};

function normalizeTier(value: string | null | undefined): ShopSubscriptionTier {
  return value === "pro" ? "pro" : "free";
}

export async function getSubscriptionAdminList(): Promise<SubscriptionAdminQueryResult> {
  const supabase = await createClient();

  const [dukkanResult, subscriptionResult, devicesResult, blogResult, storesResult, servisResult] =
    await Promise.all([
      supabase
        .from("dukkanlar")
        .select("id, dukkan_adi, slug, user_id, telefon, approval_status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("dukkan_subscriptions").select("*"),
      supabase.from("second_hand_devices").select("user_id"),
      supabase.from("dukkan_blog_yazilari").select("dukkan_id"),
      supabase.from("stores").select("id, owner_id"),
      supabase.from("service_devices").select("store_id"),
    ]);

  if (dukkanResult.error) {
    return { rows: [], error: dukkanResult.error.message };
  }

  const subscriptionMap = new Map(
    subscriptionResult.error ? [] : (subscriptionResult.data ?? []).map((row) => [row.dukkan_id, row] as const)
  );

  const devicesByUser = new Map<string, number>();
  for (const row of devicesResult.data ?? []) {
    if (!row.user_id) continue;
    devicesByUser.set(row.user_id, (devicesByUser.get(row.user_id) ?? 0) + 1);
  }

  const blogByDukkan = new Map<string, number>();
  for (const row of blogResult.data ?? []) {
    if (!row.dukkan_id) continue;
    blogByDukkan.set(row.dukkan_id, (blogByDukkan.get(row.dukkan_id) ?? 0) + 1);
  }

  const storeIdsByOwner = new Map<string, string[]>();
  for (const store of storesResult.data ?? []) {
    if (!store.owner_id) continue;
    const list = storeIdsByOwner.get(store.owner_id) ?? [];
    list.push(store.id);
    storeIdsByOwner.set(store.owner_id, list);
  }

  const servisByStore = new Map<string, number>();
  for (const row of servisResult.data ?? []) {
    if (!row.store_id) continue;
    servisByStore.set(row.store_id, (servisByStore.get(row.store_id) ?? 0) + 1);
  }

  const rows: ShopSubscriptionAdminRow[] = (dukkanResult.data ?? []).map((dukkan) => {
    const sub = subscriptionMap.get(dukkan.id);
    const usage_devices = devicesByUser.get(dukkan.user_id) ?? 0;
    const usage_blog = blogByDukkan.get(dukkan.id) ?? 0;
    const ownerStoreIds = storeIdsByOwner.get(dukkan.user_id) ?? [];
    const usage_servis = ownerStoreIds.reduce(
      (sum, storeId) => sum + (servisByStore.get(storeId) ?? 0),
      0
    );
    const usage_total = usage_devices + usage_blog + usage_servis;

    return {
      dukkan_id: dukkan.id,
      dukkan_adi: dukkan.dukkan_adi,
      slug: dukkan.slug,
      user_id: dukkan.user_id,
      telefon: dukkan.telefon,
      approval_status: dukkan.approval_status,
      tier: normalizeTier(sub?.tier),
      actions_used: sub?.actions_used ?? usage_total,
      actions_limit: sub?.actions_limit ?? DEFAULT_FREE_ACTION_LIMIT,
      expires_at: sub?.expires_at ?? null,
      usage_devices,
      usage_blog,
      usage_servis,
      usage_total,
      isPersisted: Boolean(sub),
    };
  });

  return { rows };
}
