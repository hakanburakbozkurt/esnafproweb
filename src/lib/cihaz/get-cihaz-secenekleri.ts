import { createClient } from "@/lib/supabase/server";
import type { CihazSecenekRow, SecenekKategori, SecenekTuru } from "@/lib/cihaz/secenekler";

/** Tablo okunamazsa boş liste döner; form sabit listelere düşer. */
export async function getCihazSecenekRows(): Promise<CihazSecenekRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cihaz_secenekleri")
      .select("id, kategori, tur, deger, sira")
      .order("sira", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      kategori: row.kategori as SecenekKategori,
      tur: row.tur as SecenekTuru,
      deger: row.deger,
      sira: row.sira,
    }));
  } catch {
    return [];
  }
}
