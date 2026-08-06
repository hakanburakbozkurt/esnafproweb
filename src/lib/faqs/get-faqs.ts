import { getDefaultFaqsForContext } from "@/lib/faqs/defaults";
import type { FaqContext, PlatformFaq } from "@/lib/faqs/types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

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

export async function getAllFaqsAdmin(): Promise<PlatformFaq[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("context", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return getDefaultFaqsForContext("anasayfa").concat(
        getDefaultFaqsForContext("fiyatlandirma")
      );
    }

    return data.map(rowToFaq);
  } catch {
    return getDefaultFaqsForContext("anasayfa").concat(
      getDefaultFaqsForContext("fiyatlandirma")
    );
  }
}

export function toFaqItems(faqs: PlatformFaq[]) {
  return faqs.map((faq) => ({ soru: faq.soru, cevap: faq.cevap }));
}
