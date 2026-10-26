import { ArrowRight, Check, Crown, MapPin, TriangleAlert } from "lucide-react";
import Link from "next/link";

const PRO_OZELLIKLERI = [
  "5 km içindeki telefoncular arasında Google Haritalar sıran",
  "İlk 3 rakibinin puan ve yorum karşılaştırması",
  "Haftalık sıra değişimi ve kişisel tavsiyeler",
];

export function ProUpgradeCard({
  title = "Harita Pazarı PRO Özelliği",
  description = "Google Harita sıralamalarınızı takip edin",
  price = "150₺/ay",
  suresiDoldu = false,
}: {
  title?: string;
  description?: string;
  price?: string;
  suresiDoldu?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <Crown className="size-3.5" aria-hidden />
            PRO · ULTRA
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="text-slate-600">
            {suresiDoldu ? "Planınızın süresi doldu. " : ""}
            {description}
          </p>
          <ul className="space-y-2 pt-1">
            {PRO_OZELLIKLERI.map((ozellik) => (
              <li key={ozellik} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                {ozellik}
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 rounded-2xl border border-emerald-100 bg-white/80 p-5 text-center sm:min-w-52">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">{price}</p>
          <p className="mt-1 text-xs text-slate-500">PRO plan ile başlar</p>
          <Link
            href="/fiyatlandirma"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {suresiDoldu ? "Planı yenile" : "PRO'ya geç"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EksikBilgiKarti({
  title,
  message,
  action,
  link,
  icon = "uyari",
}: {
  title: string;
  message: string;
  action: string;
  link: string;
  icon?: "uyari" | "konum";
}) {
  const Icon = icon === "konum" ? MapPin : TriangleAlert;
  return (
    <section
      role="status"
      className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 sm:flex-row sm:items-center sm:p-7"
    >
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{message}</p>
      </div>
      <Link
        href={link}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {action}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}

export function GoogleBusinessWarning() {
  return (
    <EksikBilgiKarti
      title="Google Business Profile'ını Bağla"
      message="Sıralamalarınızı takip etmek için Google Business Profile bağlantısını ekleyin. Dükkan Ayarları → Konum bölümündeki “Google İşletme / Harita Linki” alanına paylaşım bağlantınızı yapıştırın."
      action="Dükkan Ayarlarına Git"
      link="/dukkan-ayarlari#ayar-konum"
    />
  );
}

export function KonumWarning() {
  return (
    <EksikBilgiKarti
      icon="konum"
      title="Harita konumunu işaretle"
      message="Rakiplerini bulabilmemiz için mağazanın haritadaki yerini bilmemiz gerekiyor. Dükkan Ayarları → Konum bölümünde pini mağazanın üzerine bırakın."
      action="Konumu işaretle"
      link="/dukkan-ayarlari#ayar-konum"
    />
  );
}
