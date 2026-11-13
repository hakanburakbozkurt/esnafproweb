"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { safeInsertDukkan } from "@/lib/dukkan/db-payload";
import {
  buildDavetMesaji,
  buildVarsayilanAciklama,
  buildVarsayilanMetaDescription,
  buildVarsayilanMetaTitle,
  buildWhatsAppPaylasimUrl,
  ESNAF_KURULUM_FOTO_TURLERI,
  type EsnafKurulumFotoTuru,
  parseEsnafKurulumFormData,
} from "@/lib/dukkan/esnaf-adina-kurulum";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { assertSlugAvailable } from "@/lib/dukkan/slug-availability";
import { revalidateSitemap } from "@/lib/seo/sitemap-cache";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  DUKKAN_STORAGE_BUCKET,
  MAX_IMAGE_SIZE_BYTES,
  STORE_ASSETS_PREFIX,
} from "@/lib/supabase/storage.constants";
import { isValidSlugFormat, sanitizeSlugInput } from "@/lib/utils/slug";

export type EsnafKurulumState = {
  error?: string;
  success?: {
    slug: string;
    dukkanAdi: string;
    vitrinUrl: string;
    davetUrl: string;
    whatsappUrl: string;
    mesaj: string;
  };
};

export type FotoYuklemeSonucu = { url: string } | { error: string };

async function requireSuperAdmin(): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return { error: "Bu işlem yalnızca yöneticiler içindir." };
  }
  if (!isAdminClientConfigured()) {
    return { error: "Sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı değil." };
  }
  return { ok: true };
}

/** Davet bağlantısı: esnaf tıklayınca oturum açılır ve şifre belirleme sayfasına gider. */
function buildDavetUrl(tokenHash: string, tur: "invite" | "recovery"): string {
  const params = new URLSearchParams({ token_hash: tokenHash, type: tur });
  return `${getPublicSiteUrl()}/auth/davet?${params.toString()}`;
}

function uzanti(file: File): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[file.type] ?? "jpg";
}

/**
 * Tek bir fotoğrafı yükler. Fotoğraflar tek tek gönderilir; böylece sunucu
 * isteği küçük kalır (Vercel istek gövdesi sınırı).
 */
export async function adminEsnafFotoYukle(formData: FormData): Promise<FotoYuklemeSonucu> {
  const yetki = await requireSuperAdmin();
  if ("error" in yetki) return yetki;

  const slug = sanitizeSlugInput(String(formData.get("slug") ?? ""));
  if (!slug || !isValidSlugFormat(slug)) {
    return { error: "Önce geçerli bir sayfa adresi (slug) yazın." };
  }

  const tur = String(formData.get("tur") ?? "") as EsnafKurulumFotoTuru;
  if (!ESNAF_KURULUM_FOTO_TURLERI.includes(tur)) {
    return { error: "Geçersiz fotoğraf türü." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Fotoğraf bulunamadı." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Yalnızca JPEG, PNG, WebP veya GIF yükleyebilirsiniz." };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { error: "Dosya boyutu en fazla 5 MB olabilir." };
  }

  const admin = createAdminClient();
  const path = `${STORE_ASSETS_PREFIX}/${slug}/${tur}/${Date.now()}-${crypto
    .randomUUID()
    .slice(0, 8)}.${uzanti(file)}`;

  const { error } = await admin.storage.from(DUKKAN_STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    logDukkanAction("adminEsnafFotoYukle", "upload failed", { slug, tur, err: error.message });
    return { error: `Fotoğraf yüklenemedi: ${error.message}` };
  }

  const { data } = admin.storage.from(DUKKAN_STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function adminEsnafAdinaDukkanKur(
  _prev: EsnafKurulumState,
  formData: FormData
): Promise<EsnafKurulumState> {
  try {
    const yetki = await requireSuperAdmin();
    if ("error" in yetki) return yetki;

    const parsed = parseEsnafKurulumFormData(formData, process.env.NEXT_PUBLIC_SUPABASE_URL);
    if ("error" in parsed) return { error: parsed.error };
    const girdi = parsed.data;

    const admin = createAdminClient();

    const slugCheck = await assertSlugAvailable(admin, girdi.slug);
    if ("error" in slugCheck) return { error: slugCheck.error };

    // Hesabı oluşturur ve tek kullanımlık davet anahtarı üretir. E-posta gönderilmez;
    // bağlantıyı admin WhatsApp'tan iletir.
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "invite",
      email: girdi.email,
    });

    if (linkError || !linkData.user || !linkData.properties?.hashed_token) {
      const mesaj = linkError?.message ?? "Hesap oluşturulamadı.";
      logDukkanAction("adminEsnafAdinaDukkanKur", "generateLink failed", {
        email: girdi.email,
        err: mesaj,
      });
      if (/already|registered|exists/i.test(mesaj)) {
        return {
          error:
            "Bu e-posta ile zaten bir hesap var. Esnaf kendisi giriş yapıp dükkanını açabilir ya da başka bir e-posta kullanın.",
        };
      }
      return { error: `Hesap oluşturulamadı: ${mesaj}` };
    }

    const userId = linkData.user.id;

    const insertResult = await safeInsertDukkan(admin, {
      userId,
      payload: {
        dukkan_adi: girdi.dukkan_adi,
        slug: girdi.slug,
        telefon: girdi.telefon,
        whatsapp: girdi.whatsapp,
        calisma_saatleri: null,
        instagram_url: girdi.instagram_url,
        tiktok_url: null,
        facebook_url: null,
        adres: girdi.adres,
        semt: girdi.semt,
        enlem: null,
        boylam: null,
        google_business_url: null,
        aciklama: girdi.aciklama ?? buildVarsayilanAciklama(girdi),
        meta_title: buildVarsayilanMetaTitle(girdi),
        meta_description: buildVarsayilanMetaDescription(girdi),
        logo_url: girdi.logo_url,
        banner_url: girdi.banner_url,
        dukkan_fotograflari: girdi.dukkan_fotograflari,
        sss: [],
        iletisim_sss_goster: true,
        teknik_servis_aktif: girdi.teknik_servis_aktif,
        katalog_modu_aktif: false,
        teknik_servis_fotograf_1: null,
        teknik_servis_fotograf_2: null,
        teknik_servis_fotograf_3: null,
        teknik_servis_aciklama: null,
        teknik_servis_sss: [],
        hakkimizda_sss: [],
        anasayfa_sss: [],
        // Esnaf koşulları kendisi onaylayana kadar boş kalır.
        terms_accepted_at: null,
      },
    });

    if ("error" in insertResult) {
      logDukkanAction("adminEsnafAdinaDukkanKur", "insert failed", {
        slug: girdi.slug,
        err: insertResult.error,
      });
      // Dükkansız kalan hesabı geri al; aynı e-postayla tekrar denenebilsin.
      const { error: silmeHatasi } = await admin.auth.admin.deleteUser(userId);
      if (silmeHatasi) {
        logDukkanAction("adminEsnafAdinaDukkanKur", "rollback deleteUser failed", {
          userId,
          err: silmeHatasi.message,
        });
      }
      return { error: insertResult.error };
    }

    const vitrinUrl = `${getPublicSiteUrl()}/${insertResult.data.slug}`;
    const davetUrl = buildDavetUrl(linkData.properties.hashed_token, "invite");
    const mesaj = buildDavetMesaji({ dukkanAdi: girdi.dukkan_adi, vitrinUrl, davetUrl });

    revalidatePath("/yonetim/admin");
    revalidatePath("/yonetim/admin/esnaf-kurulum");
    revalidatePath(`/${insertResult.data.slug}`);
    revalidateSitemap();

    return {
      success: {
        slug: insertResult.data.slug,
        dukkanAdi: girdi.dukkan_adi,
        vitrinUrl,
        davetUrl,
        whatsappUrl: buildWhatsAppPaylasimUrl(girdi.whatsapp, mesaj),
        mesaj,
      },
    };
  } catch (err) {
    logDukkanAction("adminEsnafAdinaDukkanKur", "unexpected error", { err });
    return {
      error: err instanceof Error ? err.message : "Dükkan kurulurken beklenmeyen bir hata oluştu.",
    };
  }
}

/**
 * Davet bağlantısının süresi dolduysa veya esnaf kaybettiyse yenisini üretir.
 * Yalnızca koşulları henüz onaylanmamış (admin tarafından kurulmuş) dükkanlar için.
 */
export async function adminEsnafDavetYenile(dukkanId: string): Promise<EsnafKurulumState> {
  const yetki = await requireSuperAdmin();
  if ("error" in yetki) return yetki;

  const admin = createAdminClient();
  const { data: dukkan, error } = await admin
    .from("dukkanlar")
    .select("id, user_id, slug, dukkan_adi, whatsapp, terms_accepted_at")
    .eq("id", dukkanId)
    .maybeSingle();

  if (error || !dukkan) {
    return { error: "Dükkan bulunamadı." };
  }
  if (dukkan.terms_accepted_at) {
    return { error: "Esnaf hesabını zaten etkinleştirmiş; normal şifre sıfırlamayı kullanın." };
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(dukkan.user_id);
  const email = userData.user?.email;
  if (userError || !email) {
    return { error: "Esnafın hesabı bulunamadı." };
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    logDukkanAction("adminEsnafDavetYenile", "generateLink failed", {
      dukkanId,
      err: linkError?.message,
    });
    return { error: `Bağlantı üretilemedi: ${linkError?.message ?? "bilinmeyen hata"}` };
  }

  const vitrinUrl = `${getPublicSiteUrl()}/${dukkan.slug}`;
  const davetUrl = buildDavetUrl(linkData.properties.hashed_token, "recovery");
  const mesaj = buildDavetMesaji({ dukkanAdi: dukkan.dukkan_adi, vitrinUrl, davetUrl });

  return {
    success: {
      slug: dukkan.slug,
      dukkanAdi: dukkan.dukkan_adi,
      vitrinUrl,
      davetUrl,
      whatsappUrl: buildWhatsAppPaylasimUrl(dukkan.whatsapp, mesaj),
      mesaj,
    },
  };
}

/**
 * Esnaf, admin'in kurduğu dükkanın koşullarını onaylar. Onayla birlikte dükkan
 * yayına alınır (admin zaten kendisi kurduğu için ayrıca onay beklemez).
 */
export async function esnafKosullariOnayla(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const kabul = formData.get("kosullar") === "on" && formData.get("marka") === "on";
  if (!kabul) {
    return { error: "Devam etmek için iki onay kutusunu da işaretleyin." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("dukkanlar")
    .update({
      terms_accepted_at: new Date().toISOString(),
      approval_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .is("terms_accepted_at", null)
    // Reddedilmiş bir dükkan bu yolla yayına giremez.
    .eq("approval_status", "pending")
    .select("slug")
    .maybeSingle();

  if (error) {
    logDukkanAction("esnafKosullariOnayla", "update failed", { userId: user.id, err: error.message });
    return { error: "Onay kaydedilemedi. Lütfen tekrar deneyin." };
  }
  if (!data) {
    return { error: "Onay bekleyen bir dükkanınız bulunamadı. Destek için bize yazın." };
  }

  if (data?.slug) {
    revalidatePath(`/${data.slug}`);
    revalidateSitemap();
  }
  revalidatePath("/yonetim");
  redirect("/yonetim?hosgeldin=1");
}
