"use server";

import { revalidatePath } from "next/cache";
import {
  GooglePlacesYapilandirmaHatasi,
  isletmeAra,
  yakindakiTelefoncular,
} from "@/lib/harita-pazari/google-places";
import { kendiIsletmeniBul } from "@/lib/harita-pazari/rapor";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";

export type GooglePlaceAramaState = {
  error?: string;
  success?: string;
  /** Bulunan place_id (henüz kaydedilmeden önce göstermek için) */
  foundId?: string;
  /** İşletme adı */
  foundAd?: string;
};

export type GooglePlaceKaydetState = {
  error?: string;
  success?: string;
};

async function getAuthenticatedDukkan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın." } as const;

  const { data: dukkan, error } = await supabase
    .from("dukkanlar")
    .select("id, slug, dukkan_adi, enlem, boylam, google_place_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    logDukkanAction("googlePlace", "shop lookup failed", { error: error.message });
    return { error: "Mağaza bilgileri yüklenemedi." } as const;
  }
  if (!dukkan) return { error: "Bu hesaba bağlı bir mağaza bulunamadı." } as const;

  return { supabase, dukkan } as const;
}

/** Google Places'ta dükkanın adı + şehre göre arama yapar, en yakın eşleşmenin place_id'sini döner. */
export async function googlePlaceAra(
  _prev: GooglePlaceAramaState,
  formData: FormData
): Promise<GooglePlaceAramaState> {
  const ctx = await getAuthenticatedDukkan();
  if ("error" in ctx) return { error: ctx.error };
  const { dukkan } = ctx;

  const sorguAdi = String(formData.get("arama_adi") ?? "").trim() || dukkan.dukkan_adi;
  const sehir = String(formData.get("sehir") ?? "").trim();
  const aramaMetni = sehir ? `${sorguAdi} ${sehir}` : sorguAdi;

  if (!sorguAdi) return { error: "Mağaza adı boş olamaz." };

  try {
    const sonuclar = await isletmeAra(aramaMetni, {
      lat: dukkan.enlem ?? 39.9208,
      lng: dukkan.boylam ?? 32.8541,
    });

    // Eğer konum biliniyorsa yakındaki aramayla çapraz kontrol yap
    if (dukkan.enlem !== null && dukkan.boylam !== null) {
      const yakindaki = await yakindakiTelefoncular({ lat: dukkan.enlem, lng: dukkan.boylam });
      const yakindakiEslesen = kendiIsletmeniBul(yakindaki, {
        ad: sorguAdi,
        konum: { lat: dukkan.enlem, lng: dukkan.boylam },
      });
      if (yakindakiEslesen) {
        return { success: "İşletmeniz bulundu.", foundId: yakindakiEslesen.id, foundAd: yakindakiEslesen.ad };
      }
    }

    // Metin aramasından eşleşme dene
    const enYakin = kendiIsletmeniBul(sonuclar, {
      ad: sorguAdi,
      konum: { lat: dukkan.enlem ?? 39.9208, lng: dukkan.boylam ?? 32.8541 },
    });
    if (enYakin) {
      return { success: "İşletmeniz bulundu.", foundId: enYakin.id, foundAd: enYakin.ad };
    }

    // Eşleşme yoksa ilk sonucu öner
    if (sonuclar[0]) {
      return {
        success: `"${sonuclar[0].ad}" adlı işletme bulundu. Siz değilseniz mağaza adınızı düzeltin.`,
        foundId: sonuclar[0].id,
        foundAd: sonuclar[0].ad,
      };
    }

    return { error: `"${aramaMetni}" için Google'da kayıtlı işletme bulunamadı. Dükkan adınızı ve şehri kontrol edin.` };
  } catch (err) {
    if (err instanceof GooglePlacesYapilandirmaHatasi) {
      logDukkanAction("googlePlaceAra", "api key missing", { dukkanId: dukkan.id });
      return { error: "Google Haritalar henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin." };
    }
    logDukkanAction("googlePlaceAra", "places request failed", {
      dukkanId: dukkan.id,
      err: err instanceof Error ? err.message : err,
    });
    return { error: "Google'a bağlanılamadı. Lütfen biraz sonra tekrar deneyin." };
  }
}

/** Bulunan place_id'yi dükkan kaydına yazar. */
export async function googlePlaceKaydet(
  _prev: GooglePlaceKaydetState,
  formData: FormData
): Promise<GooglePlaceKaydetState> {
  const ctx = await getAuthenticatedDukkan();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase, dukkan } = ctx;

  const placeId = String(formData.get("place_id") ?? "").trim();
  if (!placeId) return { error: "Kaydedilecek place_id bulunamadı." };

  const { error } = await supabase
    .from("dukkanlar")
    .update({ google_place_id: placeId })
    .eq("id", dukkan.id);

  if (error) {
    logDukkanAction("googlePlaceKaydet", "update failed", { dukkanId: dukkan.id, error: error.message });
    return { error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/dukkan-ayarlari");
  revalidatePath("/dukkan-ayarlari/google-place");
  revalidatePath("/yonetim/harita-pazari");

  return { success: "Google Place ID kaydedildi! Harita Pazarı artık sizi doğru işletme olarak tanıyacak." };
}
