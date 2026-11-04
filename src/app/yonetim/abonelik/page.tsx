import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { AbonelikOdemeFormu, type SatilikPaket } from "@/components/abonelik/abonelik-odeme-formu";
import { YonetimPageShell } from "@/components/yonetim/yonetim-page-shell";
import { getShopPlan } from "@/lib/abonelik/get-shop-plan";
import {
  getOdemeAkisiModu,
  hesaplaAbonelikTutari,
  isSatinAlinabilirPaket,
  odemeKullanilabilir,
  satinAlmaEngeli,
  SURE_ETIKETLERI,
  type AbonelikSuresi,
} from "@/lib/abonelik/odeme-kurallari";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { isWholesalerAccount, resolveWholesalerPath } from "@/lib/auth/wholesaler";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { SHOP_SUBSCRIPTION_TIER_LABELS } from "@/lib/local-yonetim/subscriptions/types";
import { isIyzicoSandbox } from "@/lib/odeme/iyzico";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Abonelik",
  robots: { index: false, follow: false },
};

const title = (
  <>
    Paket ve <span className="text-emerald-600">Abonelik</span>
  </>
);
const description = "Paketini yükselt, süreni uzat, ödemelerini gör.";

const tarih = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" });
const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

const SONUC_MESAJLARI: Record<string, { metin: string; className: string }> = {
  basarili: {
    metin: "Ödemeniz alındı, paketiniz hesabınıza tanımlandı. Faturanız e-posta ile gönderilecek.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  basarisiz: {
    metin: "Ödeme tamamlanmadı. Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz.",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  inceleme: {
    metin: "Ödemeniz inceleniyor. Paketiniz kısa süre içinde tanımlanacak; sorun olursa sizinle iletişime geçeceğiz.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

const ODEME_DURUM_ETIKETLERI: Record<string, string> = {
  beklemede: "İnceleniyor",
  odendi: "Ödendi",
  basarisiz: "Başarısız",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AbonelikPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <YonetimPageShell showYonetimNav={false} title={title} description={description}>
        <AuthRequiredCard
          description="Paketini görmek için giriş yapmalısın."
          loginHref="/giris?next=/yonetim/abonelik"
        />
      </YonetimPageShell>
    );
  }

  if (await isWholesalerAccount(supabase, user)) {
    redirect(await resolveWholesalerPath(supabase, user.id));
  }

  const { data: dukkan, error: dukkanError } = await supabase
    .from("dukkanlar")
    .select("id, dukkan_adi")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dukkanError) {
    logDukkanAction("abonelikPage", "shop lookup failed", { error: dukkanError.message });
  }

  if (!dukkan) {
    return (
      <YonetimPageShell showYonetimNav={false} title={title} description={description}>
        <div className="max-w-lg rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            {dukkanError ? "Mağaza bilgileri yüklenemedi" : "Henüz mağazan yok"}
          </h2>
          {!dukkanError && (
            <Link
              href="/dukkan-ac"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Mağaza Aç
            </Link>
          )}
        </div>
      </YonetimPageShell>
    );
  }

  const [plan, plansRes, odemelerRes] = await Promise.all([
    getShopPlan(supabase, dukkan.id),
    supabase
      .from("pricing_plans")
      .select("plan_key, name, description, price_monthly, price_quarterly, price_yearly, sort_order")
      .eq("segment", "esnaf")
      .eq("is_active", true)
      .in("plan_key", ["buyume", "pro"])
      .order("sort_order", { ascending: true }),
    supabase
      .from("abonelik_odemeleri")
      .select("id, plan_key, sure_ay, tutar, durum, fatura_durumu, abonelik_bitis_at, created_at")
      .eq("dukkan_id", dukkan.id)
      // Yarıda bırakılan ödemeler gizli; incelemeye düşenler (hata_mesaji dolu) gösterilir
      .or("durum.neq.beklemede,hata_mesaji.not.is.null")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (plansRes.error) logDukkanAction("abonelikPage", "plans load failed", { error: plansRes.error.message });
  if (odemelerRes.error) logDukkanAction("abonelikPage", "payments load failed", { error: odemelerRes.error.message });

  const paketler: SatilikPaket[] = (plansRes.data ?? [])
    .filter((p) => isSatinAlinabilirPaket(p.plan_key))
    .map((p) => {
      const fiyat = {
        price_monthly: Number(p.price_monthly),
        price_quarterly: p.price_quarterly === null ? null : Number(p.price_quarterly),
        price_yearly: Number(p.price_yearly),
      };
      const planKey = p.plan_key as SatilikPaket["planKey"];
      return {
        planKey,
        ad: p.name,
        aciklama: p.description,
        fiyatlar: {
          1: hesaplaAbonelikTutari(fiyat, 1),
          3: hesaplaAbonelikTutari(fiyat, 3),
          12: hesaplaAbonelikTutari(fiyat, 12),
        },
        engel: satinAlmaEngeli(plan, planKey),
      };
    })
    .filter((p) => p.fiyatlar[1] > 0);

  const mod = getOdemeAkisiModu();
  const superAdmin = isSuperAdminUser(user);
  const odemeAcik = odemeKullanilabilir(mod, superAdmin);
  const sonucParam = typeof sp.odeme === "string" ? sp.odeme : undefined;
  const sonuc = sonucParam ? SONUC_MESAJLARI[sonucParam] : undefined;
  const efektifTier = plan.ucretliAktif ? plan.tier : "free";

  return (
    <YonetimPageShell title={title} description={description}>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {sonuc && (
          <p role="status" className={`rounded-2xl border px-4 py-3 text-sm ${sonuc.className}`}>
            {sonuc.metin}
          </p>
        )}

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Mevcut paketin</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {efektifTier === "free" ? "Ücretsiz" : SHOP_SUBSCRIPTION_TIER_LABELS[efektifTier]}
          </p>
          {plan.ucretliAktif && plan.expiresAt && (
            <p className="mt-1 text-sm text-slate-500">Bitiş: {tarih.format(new Date(plan.expiresAt))}</p>
          )}
          {!plan.ucretliAktif && plan.tier !== "free" && (
            <p className="mt-1 text-sm text-amber-700">
              {SHOP_SUBSCRIPTION_TIER_LABELS[plan.tier]} paketinin süresi doldu.
            </p>
          )}
          <Link href="/#fiyatlandirma" className="mt-3 inline-block text-sm font-medium text-emerald-700 underline">
            Paketleri karşılaştır
          </Link>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Paket satın al veya uzat</h2>
          {mod === "admin" && superAdmin && (
            <p className="mt-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
              Test modu: ödeme yalnızca süper adminlere açık{isIyzicoSandbox() ? " (iyzico sandbox, gerçek çekim yapılmaz)" : " — DİKKAT: canlı iyzico"}.
            </p>
          )}
          <div className="mt-5">
            {odemeAcik ? (
              <AbonelikOdemeFormu paketler={paketler} varsayilanEposta={user.email ?? ""} />
            ) : (
              <p className="text-sm text-slate-600">
                Online ödeme çok yakında açılıyor. Şimdilik paket için{" "}
                <Link href="/iletisim" className="font-medium text-emerald-700 underline">
                  bizimle iletişime geç
                </Link>
                .
              </p>
            )}
          </div>
        </section>

        {(odemelerRes.data?.length ?? 0) > 0 && (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Ödemelerin</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {odemelerRes.data!.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="text-slate-700">
                    {o.plan_key === "pro" ? "Pro" : "Büyüme"} ·{" "}
                    {SURE_ETIKETLERI[o.sure_ay as AbonelikSuresi] ?? `${o.sure_ay} ay`} ·{" "}
                    {tarih.format(new Date(o.created_at))}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {tl.format(Number(o.tutar))} · {ODEME_DURUM_ETIKETLERI[o.durum] ?? o.durum}
                    {o.durum === "odendi" && (o.fatura_durumu === "kesildi" ? " · Fatura kesildi" : " · Fatura hazırlanıyor")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </YonetimPageShell>
  );
}
