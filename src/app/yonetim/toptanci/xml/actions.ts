"use server";

import { revalidatePath } from "next/cache";
import { isWholesalerAccount } from "@/lib/auth/wholesaler";
import {
  isValidFeedMapping,
  parseFeedMappingForm,
} from "@/lib/toptanci/feed-mapping";
import {
  importVitrinFeedFromUrl,
  runFeedImportWithSavedMapping,
  saveUserFeedMapping,
} from "@/lib/toptanci/import-vitrin-feed";
import { uploadWholesalerFeedFile, type FeedUploadResult } from "@/lib/toptanci/upload-feed-file";
import { createClient } from "@/lib/supabase/server";

export type UploadFeedState = FeedUploadResult | Record<string, never>;

export type FeedMappingActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

async function requireWholesalerUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu işlem için giriş yapmalısınız." as const };
  }

  if (!(await isWholesalerAccount(supabase, user))) {
    return { error: "Bu panel yalnızca toptancı hesapları içindir." as const };
  }

  return { supabase, user };
}

export async function uploadWholesalerFeedAction(
  _prev: UploadFeedState,
  formData: FormData
): Promise<UploadFeedState> {
  const result = await uploadWholesalerFeedFile(formData);

  if ("success" in result && result.success) {
    revalidatePath("/yonetim/toptanci/xml");
    revalidatePath("/toptanci/xml-yukle");
  }

  return result;
}

export async function saveFeedMappingAction(
  _prev: FeedMappingActionState,
  formData: FormData
): Promise<FeedMappingActionState> {
  const auth = await requireWholesalerUser();
  if ("error" in auth) return { error: auth.error };

  const mapping = parseFeedMappingForm(formData);
  const validationError = isValidFeedMapping(mapping);
  if (validationError) return { error: validationError };

  const { error } = await saveUserFeedMapping(auth.supabase, auth.user.id, mapping);
  if (error) return { error };

  revalidatePath("/yonetim/toptanci/xml");
  return { success: true, message: "Eşleme ayarları kaydedildi. Sonraki XML yüklemelerinde kullanılacak." };
}

export async function saveFeedMappingAndImportAction(
  _prev: FeedMappingActionState,
  formData: FormData
): Promise<FeedMappingActionState> {
  const auth = await requireWholesalerUser();
  if ("error" in auth) return { error: auth.error };

  const mapping = parseFeedMappingForm(formData);
  const validationError = isValidFeedMapping(mapping);
  if (validationError) return { error: validationError };

  const feedUrl = String(formData.get("feed_url") ?? "").trim();
  if (!feedUrl) {
    return { error: "Feed URL adresi zorunludur." };
  }

  try {
    new URL(feedUrl);
  } catch {
    return { error: "Geçerli bir feed URL adresi girin." };
  }

  const result = await runFeedImportWithSavedMapping(
    auth.supabase,
    auth.user.id,
    feedUrl,
    mapping
  );

  revalidatePath("/yonetim/toptanci/xml");
  revalidatePath("/toptanci/xml-yukle");

  if (!result.ok) {
    return { error: result.message };
  }

  const { added, updated } = result.stats;
  return {
    success: true,
    message: `${added} yeni ürün eklendi, ${updated} ürün güncellendi. Mobil vitrinde görünecektir.`,
  };
}

export async function importFeedFromUrlAction(
  _prev: FeedMappingActionState,
  formData: FormData
): Promise<FeedMappingActionState> {
  const auth = await requireWholesalerUser();
  if ("error" in auth) return { error: auth.error };

  const feedUrl = String(formData.get("feed_url") ?? "").trim();
  if (!feedUrl) return { error: "Feed URL adresi zorunludur." };

  const result = await importVitrinFeedFromUrl(auth.supabase, auth.user.id, feedUrl);

  revalidatePath("/yonetim/toptanci/xml");

  if (!result.ok) return { error: result.message };

  const { added, updated } = result.stats;
  return {
    success: true,
    message: `${added} yeni ürün eklendi, ${updated} ürün güncellendi.`,
  };
}
