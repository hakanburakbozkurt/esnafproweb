import { notFound } from "next/navigation";
import { PricingAdminShell } from "@/app/yonetim/admin/fiyatlar/pricing-admin-shell";
import { FaturaFormu } from "@/app/yonetim/admin/odemeler/fatura-formu";
import { AdminNav } from "@/components/yonetim/admin-nav";
import { adminPanelClass } from "@/components/yonetim/admin-ui";
import { isSuperAdminUser } from "@/lib/auth/super-admin";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { createClient } from "@/lib/supabase/server";

const tarih = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});
const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

const DURUM_RENK: Record<string, string> = {
  odendi: "text-emerald-400",
  basarisiz: "text-red-400",
  beklemede: "text-amber-400",
};

export default async function AdminOdemelerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperAdminUser(user)) notFound();

  const { data: odemeler, error } = await supabase
    .from("abonelik_odemeleri")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) logDukkanAction("adminOdemelerPage", "load failed", { error: error.message });

  const dukkanIdleri = [...new Set((odemeler ?? []).map((o) => o.dukkan_id).filter((id): id is string => !!id))];
  const dukkanAdlari = new Map<string, string>();
  if (dukkanIdleri.length) {
    const { data: dukkanlar, error: dukkanError } = await supabase
      .from("dukkanlar")
      .select("id, dukkan_adi")
      .in("id", dukkanIdleri);
    if (dukkanError) logDukkanAction("adminOdemelerPage", "shop names failed", { error: dukkanError.message });
    for (const d of dukkanlar ?? []) dukkanAdlari.set(d.id, d.dukkan_adi);
  }

  const faturaBekleyen = (odemeler ?? []).filter(
    (o) => o.durum === "odendi" && o.fatura_durumu === "bekliyor"
  ).length;
  const inceleme = (odemeler ?? []).filter((o) => o.durum === "beklemede" && o.hata_mesaji).length;

  return (
    <PricingAdminShell
      title={
        <>
          Admin · <span className="text-indigo-400">Ödemeler</span>
        </>
      }
      description={`Fatura bekleyen: ${faturaBekleyen} · İncelenecek: ${inceleme}`}
    >
      <div className="space-y-6">
        <AdminNav current="odemeler" />
        {error && <p className="text-sm text-red-400">Ödemeler yüklenemedi.</p>}
        {(odemeler ?? []).length === 0 && !error && (
          <p className="text-sm text-zinc-400">Henüz ödeme yok.</p>
        )}
        {(odemeler ?? []).map((o) => {
          const dukkanAdi = o.dukkan_id ? dukkanAdlari.get(o.dukkan_id) : undefined;
          return (
            <article key={o.id} className={adminPanelClass}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-zinc-100">
                  {dukkanAdi ?? "Dükkan bulunamadı"} · {o.plan_key === "pro" ? "Pro" : "Büyüme"}{" "}
                  {o.sure_ay} ay · {tl.format(Number(o.tutar))}
                </h2>
                <span className={`text-sm font-semibold ${DURUM_RENK[o.durum] ?? "text-zinc-300"}`}>
                  {o.durum}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {tarih.format(new Date(o.created_at))}
                {o.iyzico_payment_id && ` · iyzico ödeme no: ${o.iyzico_payment_id}`}
                {o.abonelik_bitis_at && ` · bitiş: ${tarih.format(new Date(o.abonelik_bitis_at))}`}
              </p>
              {o.hata_mesaji && <p className="mt-2 text-sm text-amber-300">{o.hata_mesaji}</p>}
              <dl className="mt-3 grid gap-1 text-sm text-zinc-300 sm:grid-cols-2">
                <div>
                  <dt className="inline text-zinc-500">Fatura: </dt>
                  <dd className="inline">
                    {o.fatura_tipi === "kurumsal" ? "Kurumsal" : "Bireysel"} · {o.fatura_ad_unvan}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-zinc-500">{o.fatura_tipi === "kurumsal" ? "VKN / VD: " : "TCKN: "}</dt>
                  <dd className="inline">
                    {o.fatura_kimlik_no}
                    {o.fatura_vergi_dairesi && ` / ${o.fatura_vergi_dairesi}`}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="inline text-zinc-500">Adres: </dt>
                  <dd className="inline">
                    {o.fatura_adres}, {o.fatura_ilce} / {o.fatura_il}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-zinc-500">E-posta: </dt>
                  <dd className="inline">{o.fatura_eposta}</dd>
                </div>
                <div>
                  <dt className="inline text-zinc-500">Telefon: </dt>
                  <dd className="inline">{o.fatura_telefon}</dd>
                </div>
              </dl>
              {o.durum === "odendi" && (
                <div className="mt-4">
                  <FaturaFormu odemeId={o.id} faturaDurumu={o.fatura_durumu} faturaNo={o.fatura_no} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </PricingAdminShell>
  );
}
