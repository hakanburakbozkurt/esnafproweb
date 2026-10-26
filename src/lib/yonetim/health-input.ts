import type { SupabaseClient } from "@supabase/supabase-js";
import { getDukkanScoreEligibleBlogPostCount } from "@/lib/dukkan/blog-posts";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import { countDukkanFaqQuestions } from "@/lib/dukkan/shop-score-data";
import type { Database, Dukkan } from "@/types/database.types";

export function toProfileHealthInput(dukkan: Dukkan, blogPostCount: number): ProfileHealthInput {
  return {
    logo_url: dukkan.logo_url,
    banner_url: dukkan.banner_url,
    aciklama: dukkan.aciklama,
    instagram_url: dukkan.instagram_url,
    tiktok_url: dukkan.tiktok_url,
    facebook_url: dukkan.facebook_url,
    telefon: dukkan.telefon,
    whatsapp: dukkan.whatsapp,
    adres: dukkan.adres,
    enlem: dukkan.enlem,
    boylam: dukkan.boylam,
    google_business_url: dukkan.google_business_url,
    faqQuestionCount: countDukkanFaqQuestions({
      anasayfa_sss: dukkan.anasayfa_sss,
      sss: dukkan.sss,
      hakkimizda_sss: dukkan.hakkimizda_sss,
      teknik_servis_sss: dukkan.teknik_servis_sss,
    }),
    blogPostCount,
  };
}

export async function loadProfileHealthInput(
  supabase: SupabaseClient<Database>,
  dukkan: Dukkan
): Promise<ProfileHealthInput> {
  const blogPostCount = await getDukkanScoreEligibleBlogPostCount(supabase, dukkan.id);
  return toProfileHealthInput(dukkan, blogPostCount);
}
