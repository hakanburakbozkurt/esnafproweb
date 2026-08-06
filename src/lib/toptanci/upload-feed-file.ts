import { isWholesalerAccount } from "@/lib/auth/resolve-user-role";
import { importVitrinFeedFromFile, loadUserFeedMapping } from "@/lib/toptanci/import-vitrin-feed";
import { validateWholesalerFeedFile } from "@/lib/toptanci/validate-feed-file";
import { createClient } from "@/lib/supabase/server";
import { WHOLESALER_FEED_BUCKET } from "@/lib/supabase/storage.constants";

export type FeedUploadResult =
  | {
      success: true;
      url: string;
      name: string;
      importStats?: {
        added: number;
        updated: number;
        skipped: number;
        failed: number;
      };
      importWarning?: string;
    }
  | { error: string };

export async function uploadWholesalerFeedFile(formData: FormData): Promise<FeedUploadResult> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Lütfen bir dosya seçin." };
  }

  const validationError = validateWholesalerFeedFile(file);
  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Dosya yüklemek için giriş yapmalısınız." };
  }

  if (!(await isWholesalerAccount(supabase, user))) {
    return { error: "Bu işlem yalnızca toptancı hesapları içindir." };
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "xml";
  const safeExt = ["xml", "json", "xlsx", "xls", "csv"].includes(rawExt) ? rawExt : "xml";
  const storagePath = `${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(WHOLESALER_FEED_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    return {
      error:
        uploadError.message.includes("Bucket not found")
          ? "Depolama alanı henüz yapılandırılmamış. Lütfen yöneticinize başvurun."
          : uploadError.message,
    };
  }

  const { data: publicData } = supabase.storage
    .from(WHOLESALER_FEED_BUCKET)
    .getPublicUrl(storagePath);

  const listName =
    file.name.replace(/\.[^.]+$/, "").trim() || `Feed ${new Date().toLocaleDateString("tr-TR")}`;

  const { error: insertError } = await supabase.from("wholesaler_xmls").insert({
    user_id: user.id,
    name: listName,
    xml_url: publicData.publicUrl,
    is_active: true,
  });

  if (insertError) {
    return { error: `Dosya yüklendi ancak kayıt oluşturulamadı: ${insertError.message}` };
  }

  const savedMapping = await loadUserFeedMapping(supabase, user.id);

  const importResult = await importVitrinFeedFromFile(
    supabase,
    user.id,
    file,
    publicData.publicUrl,
    savedMapping
  );

  if (!importResult.ok) {
    return {
      success: true,
      url: publicData.publicUrl,
      name: listName,
      importWarning: importResult.message,
    };
  }

  return {
    success: true,
    url: publicData.publicUrl,
    name: listName,
    importStats: {
      added: importResult.stats.added,
      updated: importResult.stats.updated,
      skipped: importResult.stats.skipped,
      failed: importResult.stats.failed,
    },
  };
}
