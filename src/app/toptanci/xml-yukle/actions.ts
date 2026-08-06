"use server";

import { revalidatePath } from "next/cache";
import { isWholesalerAccount } from "@/lib/auth/wholesaler";
import { importVitrinFeedFromUrl } from "@/lib/toptanci/import-vitrin-feed";
import { createClient } from "@/lib/supabase/server";

export type SaveXmlState = {
  error?: string;
  success?: boolean;
  importMessage?: string;
};

export async function saveWholesalerXml(
  _prevState: SaveXmlState,
  formData: FormData
): Promise<SaveXmlState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "XML yüklemek için giriş yapmalısınız." };
  }

  if (!(await isWholesalerAccount(supabase, user))) {
    return { error: "Bu panel yalnızca toptancı hesapları içindir." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const xmlUrl = String(formData.get("xml_url") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!name) {
    return { error: "Liste adı zorunludur." };
  }

  if (!xmlUrl) {
    return { error: "XML URL adresi zorunludur." };
  }

  try {
    new URL(xmlUrl);
  } catch {
    return { error: "Geçerli bir XML URL adresi girin." };
  }

  const { error } = await supabase.from("wholesaler_xmls").insert({
    user_id: user.id,
    name,
    xml_url: xmlUrl,
    is_active: isActive,
  });

  if (error) {
    return { error: error.message };
  }

  const importResult = await importVitrinFeedFromUrl(supabase, user.id, xmlUrl);

  revalidatePath("/toptanci/xml-yukle");
  revalidatePath("/yonetim/toptanci/xml");

  if (!importResult.ok) {
    return {
      success: true,
      importMessage: importResult.message,
    };
  }

  const { added, updated } = importResult.stats;
  return {
    success: true,
    importMessage: `${added} yeni ürün eklendi, ${updated} ürün güncellendi. Mobil vitrinde görünecektir.`,
  };
}

async function deleteWholesalerXml(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu işlem için giriş yapmalısınız." };
  }

  if (!(await isWholesalerAccount(supabase, user))) {
    return { error: "Bu panel yalnızca toptancı hesapları içindir." };
  }

  const { error } = await supabase
    .from("wholesaler_xmls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/toptanci/xml-yukle");
  return { success: true };
}

export async function deleteWholesalerXmlAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteWholesalerXml(id);
}
