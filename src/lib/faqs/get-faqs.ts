import { getDefaultFaqsForContext } from "@/lib/faqs/defaults";
import type { FaqContext, PlatformFaq } from "@/lib/faqs/types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

export type FaqAdminQueryResult = {
  faqs: PlatformFaq[];
  error?: string;
};

function rowToFaq(row: FaqRow): PlatformFaq {
  return {
    id: row.id,
    soru: row.soru,
    cevap: row.cevap,
    sort_order: row.sort_order,
    is_active: row.is_active,
    context: row.context as FaqContext,
  };
}

/** Public landing — DB boşsa statik fallback kullanır. */
export async function getActiveFaqs(context: FaqContext): Promise<PlatformFaq[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("context", context)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return getDefaultFaqsForContext(context).filter((item) => item.is_active);
    }

    return data.map(rowToFaq);
  } catch {
    return getDefaultFaqsForContext(context).filter((item) => item.is_active);
  }
}

/** Admin panel — yalnızca Supabase kayıtları; mock fallback yok. */
export async function getAllFaqsAdmin(): Promise<FaqAdminQueryResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("context", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return { faqs: [], error: error.message };
  }

  return { faqs: (data ?? []).map(rowToFaq) };
}

export function toFaqItems(faqs: PlatformFaq[]) {
  return faqs.map((faq) => ({ soru: faq.soru, cevap: faq.cevap }));
}

export function countFaqsByContext(faqs: PlatformFaq[]) {
  return {
    anasayfa: faqs.filter((f) => f.context === "anasayfa").length,
    fiyatlandirma: faqs.filter((f) => f.context === "fiyatlandirma").length,
  };
}
