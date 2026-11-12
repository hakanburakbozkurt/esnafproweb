"use server";

import { revalidatePath } from "next/cache";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import {
  SECENEK_KATEGORILERI,
  SECENEK_TURLERI,
  type SecenekKategori,
  type SecenekTuru,
} from "@/lib/cihaz/secenekler";
import { createClient } from "@/lib/supabase/server";

export type CihazSecenekState = { error?: string; success?: boolean };

const REVALIDATE_PATHS = ["/local-yonetim/katalog", "/yonetim/urunler"] as const;

async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdminUser(user)) {
    return { error: "Bu işlem için süper admin yetkisi gerekir." as const, supabase: null };
  }

  return { error: null, supabase };
}

function parseKategori(value: FormDataEntryValue | null): SecenekKategori | null {
  const deger = String(value ?? "").trim();
  return SECENEK_KATEGORILERI.includes(deger as SecenekKategori)
    ? (deger as SecenekKategori)
    : null;
}

function parseTur(value: FormDataEntryValue | null): SecenekTuru | null {
  const deger = String(value ?? "").trim();
  return SECENEK_TURLERI.includes(deger as SecenekTuru) ? (deger as SecenekTuru) : null;
}

function revalidateSecenekPaths() {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
}

export async function addCihazSecenek(
  _prev: CihazSecenekState,
  formData: FormData
): Promise<CihazSecenekState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const kategori = parseKategori(formData.get("kategori"));
  const tur = parseTur(formData.get("tur"));
  const deger = String(formData.get("deger") ?? "").trim().replace(/\s+/g, " ");

  if (!kategori || !tur) return { error: "Kategori ve tür seçin." };
  if (!deger) return { error: "Değer boş olamaz." };
  if (deger.length > 80) return { error: "Değer en fazla 80 karakter olabilir." };

  const { data: last } = await auth.supabase
    .from("cihaz_secenekleri")
    .select("sira")
    .eq("kategori", kategori)
    .eq("tur", tur)
    .order("sira", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await auth.supabase.from("cihaz_secenekleri").insert({
    kategori,
    tur,
    deger,
    sira: (last?.sira ?? 0) + 1,
  });

  if (error) {
    if (error.code === "23505") return { error: "Bu değer zaten listede." };
    return { error: error.message };
  }

  revalidateSecenekPaths();
  return { success: true };
}

export async function deleteCihazSecenek(id: string): Promise<CihazSecenekState> {
  const auth = await assertSuperAdmin();
  if (auth.error || !auth.supabase) return { error: auth.error ?? "Yetki hatası." };

  const { error } = await auth.supabase.from("cihaz_secenekleri").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateSecenekPaths();
  return { success: true };
}
