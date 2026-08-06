"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isWholesalerAccount,
  WHOLESALER_ONBOARDING_PATH,
  WHOLESALER_XML_PATH,
  wholesalerStoreAccessError,
} from "@/lib/auth/wholesaler";
import { assertSlugAvailableGlobal } from "@/lib/toptanci/slug-availability";
import { getToptanciByUserId } from "@/lib/toptanci/get-toptanci";
import { createClient } from "@/lib/supabase/server";
import { slugify, sanitizeSlugInput } from "@/lib/utils/slug";
import { validateDukkanAdi, validateSlug } from "@/lib/utils/reserved-slugs";

export type ToptanciFormState = {
  error?: string;
  success?: boolean;
  slug?: string;
};

function parseToptanciFormData(formData: FormData) {
  const firmaAdi = String(formData.get("firma_adi") ?? "").trim();
  const slug =
    sanitizeSlugInput(String(formData.get("slug") ?? "").trim()) || slugify(firmaAdi);
  const unvan = String(formData.get("unvan") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();

  const firmaError = validateDukkanAdi(firmaAdi);
  if (firmaError) return { error: firmaError } as const;

  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError } as const;

  if (!unvan) {
    return { error: "Firma unvanı zorunludur." } as const;
  }

  if (!adres) {
    return { error: "Adres zorunludur." } as const;
  }

  return {
    data: {
      firma_adi: firmaAdi,
      slug,
      unvan,
      adres,
      telefon: telefon || null,
    },
  } as const;
}

export async function createToptanciProfile(
  _prev: ToptanciFormState,
  formData: FormData
): Promise<ToptanciFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Toptancı profili oluşturmak için giriş yapmalısınız." };
  }

  if (!(await isWholesalerAccount(supabase, user))) {
    return { error: wholesalerStoreAccessError() };
  }

  const existing = await getToptanciByUserId(supabase, user.id);
  if (existing?.slug) {
    redirect(WHOLESALER_XML_PATH);
  }

  const parsed = parseToptanciFormData(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const slugCheck = await assertSlugAvailableGlobal(supabase, parsed.data.slug);
  if ("error" in slugCheck) {
    return { error: slugCheck.error };
  }

  const { error } = await supabase.from("toptancilar").insert({
    user_id: user.id,
    firma_adi: parsed.data.firma_adi,
    slug: parsed.data.slug,
    unvan: parsed.data.unvan,
    adres: parsed.data.adres,
    telefon: parsed.data.telefon,
    aktif: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu slug zaten kullanılıyor. Lütfen farklı bir adres seçin." };
    }
    return { error: error.message };
  }

  revalidatePath(WHOLESALER_ONBOARDING_PATH);
  revalidatePath(WHOLESALER_XML_PATH);
  redirect(WHOLESALER_XML_PATH);
}

export async function updateToptanciProfile(
  _prev: ToptanciFormState,
  formData: FormData
): Promise<ToptanciFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Profili güncellemek için giriş yapmalısınız." };
  }

  if (!(await isWholesalerAccount(supabase, user))) {
    return { error: wholesalerStoreAccessError() };
  }

  const current = await getToptanciByUserId(supabase, user.id);
  if (!current) {
    return { error: "Önce toptancı profilinizi oluşturmalısınız." };
  }

  const parsed = parseToptanciFormData(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const slugCheck = await assertSlugAvailableGlobal(supabase, parsed.data.slug, {
    excludeToptanciId: current.id,
  });
  if ("error" in slugCheck) {
    return { error: slugCheck.error };
  }

  const { data, error } = await supabase
    .from("toptancilar")
    .update({
      firma_adi: parsed.data.firma_adi,
      slug: parsed.data.slug,
      unvan: parsed.data.unvan,
      adres: parsed.data.adres,
      telefon: parsed.data.telefon,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .eq("user_id", user.id)
    .select("slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu slug zaten kullanılıyor. Lütfen farklı bir adres seçin." };
    }
    return { error: error.message };
  }

  revalidatePath(WHOLESALER_ONBOARDING_PATH);
  revalidatePath(WHOLESALER_XML_PATH);
  revalidatePath("/toptanci-ayarlari");

  return { success: true, slug: data.slug };
}
