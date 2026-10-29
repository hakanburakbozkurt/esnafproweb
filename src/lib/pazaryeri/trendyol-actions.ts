"use server";

import { revalidatePath } from "next/cache";
import { isWholesalerAccount, wholesalerStoreAccessError } from "@/lib/auth/wholesaler";
import { URUN_BARKOD_PATTERN } from "@/lib/dukkan/form-data";
import { logDukkanAction } from "@/lib/dukkan/logger";
import {
  createTrendyolUrunler,
  getTrendyolBatchSonucu,
  getTrendyolKategoriAgaci,
  getTrendyolKategoriOzellikleri,
  getTrendyolOzellikDegerleri,
  isTrendyolUrunOnayli,
  searchTrendyolMarka,
  testTrendyolBaglanti,
  TrendyolApiError,
  updateTrendyolStokFiyat,
  type TrendyolKimlik,
  type TrendyolMarka,
  type TrendyolOzellikDegeri,
} from "@/lib/pazaryeri/trendyol/client";
import {
  buildTrendyolStokFiyatItem,
  buildTrendyolUrunItem,
  flattenTrendyolKategoriler,
  isTrendyolKdvOrani,
  searchTrendyolKategoriler,
  validateTrendyolGonderim,
  type TrendyolKategoriOzelligi,
  type TrendyolOzellikSecimi,
  type TrendyolYaprakKategori,
} from "@/lib/pazaryeri/trendyol/payload";
import { createClient } from "@/lib/supabase/server";
import type { DukkanUrunu, Json, PazaryeriUrunDurumu } from "@/types/database.types";

const PLATFORM = "trendyol" as const;
const SAYFA_YOLU = "/dukkan-ayarlari/pazaryeri";

type Hata = { error: string };
type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

type Baglam = {
  supabase: SupabaseServer;
  dukkanId: string;
};

async function getBaglam(action: string): Promise<Baglam | Hata> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bu işlem için giriş yapmalısınız." };
  if (await isWholesalerAccount(supabase, user)) {
    return { error: wholesalerStoreAccessError() };
  }

  const { data: dukkan, error } = await supabase
    .from("dukkanlar")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    logDukkanAction(action, "shop lookup failed", { error: error.message });
    return { error: "Mağaza bilgisi okunamadı. Lütfen tekrar deneyin." };
  }
  if (!dukkan) return { error: "Önce bir mağaza oluşturmalısınız." };

  return { supabase, dukkanId: dukkan.id };
}

async function getKimlik(
  action: string,
  { supabase, dukkanId }: Baglam
): Promise<TrendyolKimlik | Hata> {
  const { data, error } = await supabase.rpc("pazaryeri_baglanti_kimlik", {
    p_dukkan_id: dukkanId,
    p_platform: PLATFORM,
  });

  if (error) {
    logDukkanAction(action, "credential read failed", { dukkanId, error: error.message });
    return { error: "Trendyol bağlantı bilgileri okunamadı. Lütfen tekrar deneyin." };
  }
  const row = data?.[0];
  if (!row) {
    return { error: "Önce Trendyol hesabınızı bağlayın." };
  }
  return { saticiId: row.satici_id, apiKey: row.api_key, apiSecret: row.api_secret };
}

function trendyolHatasi(action: string, err: unknown, context: Record<string, unknown>): Hata {
  if (err instanceof TrendyolApiError) {
    logDukkanAction(action, "trendyol api error", {
      ...context,
      status: err.status,
      detail: err.detail,
    });
    const ek = err.detail && err.status >= 400 && err.status < 500 && err.status !== 401
      ? ` (Trendyol: ${err.detail.slice(0, 200)})`
      : "";
    return { error: `${err.message}${ek}` };
  }
  logDukkanAction(action, "unexpected error", {
    ...context,
    err: err instanceof Error ? err.message : String(err),
  });
  return { error: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin." };
}

function isHata(value: unknown): value is Hata {
  return Boolean(value && typeof value === "object" && "error" in value);
}

// ---------------------------------------------------------------------------
// Bağlantı
// ---------------------------------------------------------------------------

export type TrendyolBaglantiFormState = { error?: string; success?: boolean };

export async function trendyolBaglantiKaydet(
  _prev: TrendyolBaglantiFormState,
  formData: FormData
): Promise<TrendyolBaglantiFormState> {
  const action = "trendyolBaglantiKaydet";
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;

    const saticiId = String(formData.get("satici_id") ?? "").trim();
    const apiKey = String(formData.get("api_key") ?? "").trim();
    const apiSecret = String(formData.get("api_secret") ?? "").trim();

    if (!/^\d{1,20}$/.test(saticiId)) {
      return { error: "Satıcı ID yalnızca rakamlardan oluşmalı." };
    }
    if (!apiKey || apiKey.length > 200 || !apiSecret || apiSecret.length > 200) {
      return { error: "API key ve API secret alanlarını doldurun." };
    }

    const kimlik: TrendyolKimlik = { saticiId, apiKey, apiSecret };

    // Kaydetmeden önce bilgilerin gerçekten çalıştığını doğrula.
    try {
      await testTrendyolBaglanti(kimlik);
    } catch (err) {
      return trendyolHatasi(action, err, { dukkanId: baglam.dukkanId, step: "test" });
    }

    const { error } = await baglam.supabase.rpc("pazaryeri_baglanti_kaydet", {
      p_dukkan_id: baglam.dukkanId,
      p_platform: PLATFORM,
      p_satici_id: saticiId,
      p_api_key: apiKey,
      p_api_secret: apiSecret,
    });

    if (error) {
      logDukkanAction(action, "credential save failed", {
        dukkanId: baglam.dukkanId,
        error: error.message,
      });
      return { error: "Bağlantı kaydedilemedi. Lütfen tekrar deneyin." };
    }

    revalidatePath(SAYFA_YOLU);
    return { success: true };
  } catch (err) {
    return trendyolHatasi(action, err, {});
  }
}

export async function trendyolBaglantiSil(): Promise<{ ok: true } | Hata> {
  const action = "trendyolBaglantiSil";
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;

    const { error } = await baglam.supabase.rpc("pazaryeri_baglanti_sil", {
      p_dukkan_id: baglam.dukkanId,
      p_platform: PLATFORM,
    });
    if (error) {
      logDukkanAction(action, "delete failed", { dukkanId: baglam.dukkanId, error: error.message });
      return { error: "Bağlantı kaldırılamadı. Lütfen tekrar deneyin." };
    }
    revalidatePath(SAYFA_YOLU);
    return { ok: true };
  } catch (err) {
    return trendyolHatasi(action, err, {});
  }
}

export async function trendyolBaglantiTest(): Promise<{ ok: true } | Hata> {
  const action = "trendyolBaglantiTest";
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;
    const kimlik = await getKimlik(action, baglam);
    if (isHata(kimlik)) return kimlik;

    let basarili = true;
    let sonuc: { ok: true } | Hata = { ok: true };
    try {
      await testTrendyolBaglanti(kimlik);
    } catch (err) {
      basarili = false;
      sonuc = trendyolHatasi(action, err, { dukkanId: baglam.dukkanId });
    }

    const { error } = await baglam.supabase.rpc("pazaryeri_baglanti_test_sonucu", {
      p_dukkan_id: baglam.dukkanId,
      p_platform: PLATFORM,
      p_basarili: basarili,
    });
    if (error) {
      logDukkanAction(action, "test result save failed", {
        dukkanId: baglam.dukkanId,
        error: error.message,
      });
    }
    revalidatePath(SAYFA_YOLU);
    return sonuc;
  } catch (err) {
    return trendyolHatasi(action, err, {});
  }
}

// ---------------------------------------------------------------------------
// Kategori, özellik, marka arama
// ---------------------------------------------------------------------------

export async function trendyolKategoriAra(
  sorgu: unknown
): Promise<{ kategoriler: TrendyolYaprakKategori[] } | Hata> {
  const action = "trendyolKategoriAra";
  const metin = typeof sorgu === "string" ? sorgu.trim().slice(0, 80) : "";
  if (metin.length < 2) return { kategoriler: [] };
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;
    const kimlik = await getKimlik(action, baglam);
    if (isHata(kimlik)) return kimlik;

    const agac = await getTrendyolKategoriAgaci(kimlik);
    return { kategoriler: searchTrendyolKategoriler(flattenTrendyolKategoriler(agac), metin) };
  } catch (err) {
    return trendyolHatasi(action, err, {});
  }
}

export type TrendyolZorunluOzellik = TrendyolKategoriOzelligi & {
  degerler: TrendyolOzellikDegeri[];
};

export async function trendyolKategoriOzellikleri(
  kategoriId: unknown
): Promise<{ ozellikler: TrendyolZorunluOzellik[] } | Hata> {
  const action = "trendyolKategoriOzellikleri";
  if (typeof kategoriId !== "number" || !Number.isInteger(kategoriId) || kategoriId <= 0) {
    return { error: "Geçersiz kategori." };
  }
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;
    const kimlik = await getKimlik(action, baglam);
    if (isHata(kimlik)) return kimlik;

    const tum = await getTrendyolKategoriOzellikleri(kimlik, kategoriId);
    // İlk sürümde yalnızca zorunlu özellikleri soruyoruz.
    const zorunlu = tum.filter((o) => o.required);
    const ozellikler: TrendyolZorunluOzellik[] = [];
    for (const ozellik of zorunlu) {
      const degerler = await getTrendyolOzellikDegerleri(kimlik, kategoriId, ozellik.attributeId);
      ozellikler.push({ ...ozellik, degerler });
    }
    return { ozellikler };
  } catch (err) {
    return trendyolHatasi(action, err, { kategoriId });
  }
}

export async function trendyolMarkaAra(
  ad: unknown
): Promise<{ markalar: TrendyolMarka[] } | Hata> {
  const action = "trendyolMarkaAra";
  const metin = typeof ad === "string" ? ad.trim().slice(0, 80) : "";
  if (metin.length < 2) return { markalar: [] };
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;
    const kimlik = await getKimlik(action, baglam);
    if (isHata(kimlik)) return kimlik;

    return { markalar: await searchTrendyolMarka(kimlik, metin) };
  } catch (err) {
    return trendyolHatasi(action, err, {});
  }
}

// ---------------------------------------------------------------------------
// Ürün gönderme ve durum
// ---------------------------------------------------------------------------

export type TrendyolGonderGirdisi = {
  barkod: string;
  markaId: number;
  markaAdi: string;
  kategoriId: number;
  kategoriAdi: string;
  kdvOrani: number;
  ozellikler: TrendyolOzellikSecimi[];
};

function parseGonderGirdisi(input: unknown): TrendyolGonderGirdisi | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  const intOk = (v: unknown) => typeof v === "number" && Number.isInteger(v) && v > 0;
  if (typeof r.barkod !== "string" || !URUN_BARKOD_PATTERN.test(r.barkod)) return null;
  if (!intOk(r.markaId) || !intOk(r.kategoriId)) return null;
  if (!isTrendyolKdvOrani(r.kdvOrani)) return null;
  if (!Array.isArray(r.ozellikler) || r.ozellikler.length > 100) return null;

  const ozellikler: TrendyolOzellikSecimi[] = [];
  for (const raw of r.ozellikler) {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    if (!intOk(o.attributeId)) return null;
    if (intOk(o.attributeValueId)) {
      ozellikler.push({ attributeId: o.attributeId as number, attributeValueId: o.attributeValueId as number });
    } else if (typeof o.customAttributeValue === "string" && o.customAttributeValue.trim()) {
      ozellikler.push({
        attributeId: o.attributeId as number,
        customAttributeValue: o.customAttributeValue.trim().slice(0, 100),
      });
    }
  }

  return {
    barkod: r.barkod,
    markaId: r.markaId as number,
    markaAdi: typeof r.markaAdi === "string" ? r.markaAdi.slice(0, 120) : "",
    kategoriId: r.kategoriId as number,
    kategoriAdi: typeof r.kategoriAdi === "string" ? r.kategoriAdi.slice(0, 300) : "",
    kdvOrani: r.kdvOrani,
    ozellikler,
  };
}

type UrunAramaSonucu =
  | { urun: DukkanUrunu }
  | { error: string; detail?: string };

async function urunuBul(baglam: Baglam, barkod: string): Promise<UrunAramaSonucu> {
  const { data, error } = await baglam.supabase
    .from("dukkan_urunleri")
    .select("*")
    .eq("dukkan_id", baglam.dukkanId)
    .eq("barkod", barkod)
    .eq("aktif", true)
    .limit(2);
  if (error) return { error: "Ürün okunamadı. Lütfen tekrar deneyin.", detail: error.message };
  if (!data?.length) return { error: "Bu barkodla kayıtlı ürün bulunamadı." };
  if (data.length > 1) {
    return { error: "Bu barkod birden fazla üründe kullanılmış. Her ürünün barkodu farklı olmalı." };
  }
  return { urun: data[0] };
}

export type TrendyolGonderSonucu =
  | { ok: true; durum: PazaryeriUrunDurumu }
  | { error: string; hatalar?: string[] };

export async function trendyolUrunGonder(input: unknown): Promise<TrendyolGonderSonucu> {
  const action = "trendyolUrunGonder";
  const girdi = parseGonderGirdisi(input);
  if (!girdi) return { error: "Gönderim bilgileri eksik veya hatalı." };

  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;
    const kimlik = await getKimlik(action, baglam);
    if (isHata(kimlik)) return kimlik;

    const bulunan = await urunuBul(baglam, girdi.barkod);
    if ("error" in bulunan) {
      if (bulunan.detail) {
        logDukkanAction(action, "product lookup failed", { detail: bulunan.detail });
      }
      return { error: bulunan.error };
    }
    const { urun } = bulunan;

    const kayit = {
      dukkan_id: baglam.dukkanId,
      platform: PLATFORM,
      barkod: girdi.barkod,
      marka_id: girdi.markaId,
      marka_adi: girdi.markaAdi || null,
      kategori_id: girdi.kategoriId,
      kategori_adi: girdi.kategoriAdi || null,
      kdv_orani: girdi.kdvOrani,
      ozellikler: girdi.ozellikler as unknown as Json,
      updated_at: new Date().toISOString(),
    };

    // Zorunlu özellikleri Trendyol'dan tekrar alıp sunucuda doğrula.
    const kategoriOzellikleri = await getTrendyolKategoriOzellikleri(kimlik, girdi.kategoriId);
    const bilgi = {
      markaId: girdi.markaId,
      kategoriId: girdi.kategoriId,
      kdvOrani: girdi.kdvOrani,
      ozellikler: girdi.ozellikler,
    };
    const hatalar = validateTrendyolGonderim(urun, bilgi, kategoriOzellikleri);
    if (hatalar.length) {
      const { error: taslakError } = await baglam.supabase
        .from("pazaryeri_urunleri")
        .upsert({ ...kayit, durum: "taslak" }, { onConflict: "dukkan_id,platform,barkod" });
      if (taslakError) {
        logDukkanAction(action, "draft save failed", { error: taslakError.message });
      }
      return { error: "Gönderilmeden önce düzeltilmesi gerekenler var.", hatalar };
    }

    let batchId: string;
    try {
      batchId = await createTrendyolUrunler(kimlik, [buildTrendyolUrunItem(urun, bilgi)]);
    } catch (err) {
      const hata = trendyolHatasi(action, err, { dukkanId: baglam.dukkanId, barkod: girdi.barkod });
      const { error: hataKayitError } = await baglam.supabase.from("pazaryeri_urunleri").upsert(
        { ...kayit, durum: "hata", son_hata: hata.error },
        { onConflict: "dukkan_id,platform,barkod" }
      );
      if (hataKayitError) {
        logDukkanAction(action, "error status save failed", { error: hataKayitError.message });
      }
      revalidatePath(SAYFA_YOLU);
      return hata;
    }

    const { error } = await baglam.supabase.from("pazaryeri_urunleri").upsert(
      {
        ...kayit,
        durum: "gonderildi",
        batch_request_id: batchId,
        son_hata: null,
        son_gonderim_at: new Date().toISOString(),
      },
      { onConflict: "dukkan_id,platform,barkod" }
    );
    if (error) {
      // Trendyol'a gitti ama kaydımız düşmedi: kullanıcı tekrar göndermesin diye açıkça söyle.
      logDukkanAction(action, "status save failed after send", {
        dukkanId: baglam.dukkanId,
        barkod: girdi.barkod,
        batchId,
        error: error.message,
      });
      return {
        error: `Ürün Trendyol'a gönderildi (işlem no: ${batchId}) ama durumu kaydedilemedi. Tekrar göndermeden önce Trendyol panelini kontrol edin.`,
      };
    }

    revalidatePath(SAYFA_YOLU);
    return { ok: true, durum: "gonderildi" };
  } catch (err) {
    return trendyolHatasi(action, err, { barkod: girdi.barkod });
  }
}

export async function trendyolDurumYenile(barkod: unknown): Promise<TrendyolGonderSonucu> {
  const action = "trendyolDurumYenile";
  if (typeof barkod !== "string" || !URUN_BARKOD_PATTERN.test(barkod)) {
    return { error: "Geçersiz barkod." };
  }
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;
    const kimlik = await getKimlik(action, baglam);
    if (isHata(kimlik)) return kimlik;

    const { data: kayit, error } = await baglam.supabase
      .from("pazaryeri_urunleri")
      .select("*")
      .eq("dukkan_id", baglam.dukkanId)
      .eq("platform", PLATFORM)
      .eq("barkod", barkod)
      .maybeSingle();
    if (error || !kayit) {
      if (error) logDukkanAction(action, "row read failed", { error: error.message });
      return { error: "Bu ürün için Trendyol kaydı bulunamadı." };
    }

    let durum: PazaryeriUrunDurumu = kayit.durum;
    let sonHata: string | null = kayit.son_hata;

    if (durum === "gonderildi" && kayit.batch_request_id) {
      try {
        const sonuc = await getTrendyolBatchSonucu(kimlik, kayit.batch_request_id);
        const oge = sonuc.ogeler.find((o) => o.barkod === barkod) ?? sonuc.ogeler[0];
        if (oge?.basarili) {
          durum = "onay_bekliyor";
          sonHata = null;
        } else if (oge && oge.hatalar.length) {
          durum = "hata";
          sonHata = oge.hatalar.join(" ").slice(0, 1000);
        }
      } catch (err) {
        // İşlem sonuçları Trendyol'da yalnızca 4 saat tutuluyor; sonra onay kontrolüne geç.
        if (!(err instanceof TrendyolApiError && err.status === 404)) {
          return trendyolHatasi(action, err, { barkod });
        }
        durum = "onay_bekliyor";
      }
    }

    if (durum === "onay_bekliyor" && (await isTrendyolUrunOnayli(kimlik, barkod))) {
      durum = "yayinda";
    }

    if (durum !== kayit.durum || sonHata !== kayit.son_hata) {
      const { error: updateError } = await baglam.supabase
        .from("pazaryeri_urunleri")
        .update({ durum, son_hata: sonHata, updated_at: new Date().toISOString() })
        .eq("id", kayit.id);
      if (updateError) {
        logDukkanAction(action, "status update failed", { error: updateError.message });
        return { error: "Durum güncellenemedi. Lütfen tekrar deneyin." };
      }
      revalidatePath(SAYFA_YOLU);
    }

    return { ok: true, durum };
  } catch (err) {
    return trendyolHatasi(action, err, { barkod });
  }
}

export async function trendyolStokFiyatGonder(): Promise<
  { ok: true; gonderilen: number; atlanan: number } | Hata
> {
  const action = "trendyolStokFiyatGonder";
  try {
    const baglam = await getBaglam(action);
    if (isHata(baglam)) return baglam;
    const kimlik = await getKimlik(action, baglam);
    if (isHata(kimlik)) return kimlik;

    const { data: kayitlar, error } = await baglam.supabase
      .from("pazaryeri_urunleri")
      .select("id, barkod")
      .eq("dukkan_id", baglam.dukkanId)
      .eq("platform", PLATFORM)
      .in("durum", ["onay_bekliyor", "yayinda"]);
    if (error) {
      logDukkanAction(action, "rows read failed", { error: error.message });
      return { error: "Trendyol ürünleri okunamadı. Lütfen tekrar deneyin." };
    }
    if (!kayitlar?.length) {
      return { error: "Trendyol'da onaylanmış ya da onay bekleyen ürününüz yok." };
    }

    const { data: urunler, error: urunError } = await baglam.supabase
      .from("dukkan_urunleri")
      .select("barkod, fiyat, stok_adedi")
      .eq("dukkan_id", baglam.dukkanId)
      .eq("aktif", true)
      .in(
        "barkod",
        kayitlar.map((k) => k.barkod)
      );
    if (urunError) {
      logDukkanAction(action, "products read failed", { error: urunError.message });
      return { error: "Ürünler okunamadı. Lütfen tekrar deneyin." };
    }

    const items = (urunler ?? [])
      .map(buildTrendyolStokFiyatItem)
      .filter((item): item is NonNullable<typeof item> => item !== null);
    const atlanan = kayitlar.length - items.length;
    if (!items.length) {
      return { error: "Gönderilecek geçerli fiyatlı ürün bulunamadı. Fiyatları kontrol edin." };
    }

    const batchId = await updateTrendyolStokFiyat(kimlik, items);
    const simdi = new Date().toISOString();
    const { error: updateError } = await baglam.supabase
      .from("pazaryeri_urunleri")
      .update({ stok_fiyat_batch_id: batchId, son_senkron_at: simdi, updated_at: simdi })
      .eq("dukkan_id", baglam.dukkanId)
      .eq("platform", PLATFORM)
      .in(
        "barkod",
        items.map((i) => i.barcode)
      );
    if (updateError) {
      logDukkanAction(action, "sync stamp failed", { error: updateError.message, batchId });
    }

    revalidatePath(SAYFA_YOLU);
    return { ok: true, gonderilen: items.length, atlanan };
  } catch (err) {
    return trendyolHatasi(action, err, {});
  }
}
