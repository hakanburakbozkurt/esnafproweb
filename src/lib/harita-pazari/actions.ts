"use server";

import { revalidatePath } from "next/cache";
import { getShopPlan } from "@/lib/abonelik/get-shop-plan";
import { getDukkanScoreEligibleBlogPostCount } from "@/lib/dukkan/blog-posts";
import { hasGoogleBusinessUrl } from "@/lib/dukkan/google-business-url";
import { logDukkanAction } from "@/lib/dukkan/logger";
import {
  GooglePlacesYapilandirmaHatasi,
  isletmeAra,
  isletmeDetayi,
  yakindakiTelefoncular,
} from "@/lib/harita-pazari/google-places";
import {
  karsilastirmaTaramasiSec,
  kendiIsletmeniBul,
  raporOlustur,
  type HaritaPazariRaporu,
  type HaritaPlace,
} from "@/lib/harita-pazari/rapor";
import { createClient } from "@/lib/supabase/server";

/** Sıra geçmişine günde en fazla bir anlık görüntü yazılır. */
const TARAMA_KAYIT_ARALIGI_MS = 20 * 60 * 60 * 1000;

export type HaritaPazariSonuc =
  | { ok: true; rapor: HaritaPazariRaporu; olusturulma: string; uyari?: string }
  | { ok: false; error: string };

export type HaritaRaporAyarlariState = { error?: string; success?: string };

async function loadContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın." } as const;

  const { data: dukkan, error } = await supabase
    .from("dukkanlar")
    .select("id, slug, dukkan_adi, enlem, boylam, google_business_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    logDukkanAction("haritaPazari", "shop lookup failed", { error: error.message });
    return { error: "Mağaza bilgileri yüklenemedi. Lütfen sayfayı yenileyin." } as const;
  }
  if (!dukkan) return { error: "Bu hesaba bağlı bir mağaza bulunamadı." } as const;

  const plan = await getShopPlan(supabase, dukkan.id);
  if (!plan.ucretliAktif) {
    return { error: "Harita Pazarı PRO ve ULTRA planlarda kullanılabilir." } as const;
  }

  return { supabase, dukkan } as const;
}

export async function haritaPazariRaporuGetir(): Promise<HaritaPazariSonuc> {
  const context = await loadContext();
  if ("error" in context) return { ok: false, error: context.error! };
  const { supabase, dukkan } = context;

  if (!hasGoogleBusinessUrl(dukkan.google_business_url)) {
    return { ok: false, error: "Önce Google İşletme profil bağlantınızı ekleyin." };
  }
  if (dukkan.enlem === null || dukkan.boylam === null) {
    return { ok: false, error: "Önce Dükkan Ayarları'nda harita konumunuzu işaretleyin." };
  }
  const konum = { lat: dukkan.enlem, lng: dukkan.boylam };

  const { data: taramalar, error: taramaError } = await supabase
    .from("harita_pazari_taramalari")
    .select("created_at, kendi_place_id, siralama")
    .eq("dukkan_id", dukkan.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (taramaError) {
    logDukkanAction("haritaPazari", "scan history lookup failed", {
      dukkanId: dukkan.id,
      error: taramaError.message,
    });
  }
  const gecmis = taramalar ?? [];

  try {
    const siralama = await yakindakiTelefoncular(konum);

    let kendiPlace: HaritaPlace | null = null;
    const bilinenId = gecmis.find((t) => t.kendi_place_id)?.kendi_place_id;
    if (bilinenId) {
      kendiPlace = siralama.find((p) => p.id === bilinenId) ?? (await isletmeDetayi(bilinenId));
    }
    kendiPlace ??=
      kendiIsletmeniBul(siralama, { ad: dukkan.dukkan_adi, konum }) ??
      kendiIsletmeniBul(await isletmeAra(dukkan.dukkan_adi, konum), { ad: dukkan.dukkan_adi, konum });

    const simdi = new Date();
    const karsilastirma = karsilastirmaTaramasiSec(gecmis, simdi);
    const blogYaziSayisi = await getDukkanScoreEligibleBlogPostCount(supabase, dukkan.id);

    const rapor = raporOlustur({
      siralama,
      kendiPlace,
      dukkanKonum: konum,
      oncekiSiralama: karsilastirma?.siralama ?? null,
      karsilastirmaTarihi: karsilastirma?.created_at ?? null,
      blogYaziSayisi,
    });

    let uyari: string | undefined;
    const sonTarama = gecmis[0];
    if (!sonTarama || simdi.getTime() - new Date(sonTarama.created_at).getTime() >= TARAMA_KAYIT_ARALIGI_MS) {
      const { error: insertError } = await supabase.from("harita_pazari_taramalari").insert({
        dukkan_id: dukkan.id,
        kendi_place_id: kendiPlace?.id ?? null,
        kendi_sira: rapor.kendi?.sira ?? null,
        siralama: siralama.map((p) => p.id),
      });
      if (insertError) {
        logDukkanAction("haritaPazari", "scan insert failed", {
          dukkanId: dukkan.id,
          error: insertError.message,
        });
        uyari = "Sıralama geçmişi kaydedilemedi; sıra değişimleri bir sonraki taramada hesaplanacak.";
      }
    }

    return { ok: true, rapor, olusturulma: simdi.toISOString(), uyari };
  } catch (err) {
    if (err instanceof GooglePlacesYapilandirmaHatasi) {
      logDukkanAction("haritaPazari", "places api key missing", { dukkanId: dukkan.id });
      return {
        ok: false,
        error: "Google Haritalar bağlantısı henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin.",
      };
    }
    logDukkanAction("haritaPazari", "places request failed", {
      dukkanId: dukkan.id,
      err: err instanceof Error ? err.message : err,
    });
    return { ok: false, error: "Google Haritalar verileri alınamadı. Lütfen biraz sonra tekrar deneyin." };
  }
}

function parseIntInRange(value: FormDataEntryValue | null, min: number, max: number): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export async function haritaRaporAyarlariniKaydet(
  _prev: HaritaRaporAyarlariState,
  formData: FormData
): Promise<HaritaRaporAyarlariState> {
  const context = await loadContext();
  if ("error" in context) return { error: context.error };
  const { supabase, dukkan } = context;

  const gonderimGunu = parseIntInRange(formData.get("gonderim_gunu"), 1, 7);
  const gonderimSaati = parseIntInRange(formData.get("gonderim_saati"), 0, 23);
  if (gonderimGunu === null || gonderimSaati === null) {
    return { error: "Geçerli bir gün ve saat seçin." };
  }

  try {
    const { error } = await supabase.from("harita_pazari_rapor_ayarlari").upsert(
      {
        dukkan_id: dukkan.id,
        eposta_aktif: formData.get("eposta_aktif") === "true",
        ayrintili: formData.get("ayrintili") === "true",
        gonderim_gunu: gonderimGunu,
        gonderim_saati: gonderimSaati,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "dukkan_id" }
    );

    if (error) {
      logDukkanAction("haritaRaporAyarlari", "upsert failed", { dukkanId: dukkan.id, error: error.message });
      return { error: "Rapor ayarları kaydedilemedi. Lütfen tekrar deneyin." };
    }
  } catch (err) {
    logDukkanAction("haritaRaporAyarlari", "unexpected error", { err });
    return { error: err instanceof Error ? err.message : "Rapor ayarları kaydedilemedi." };
  }

  revalidatePath("/yonetim/harita-pazari");
  return { success: "Rapor ayarları kaydedildi." };
}
