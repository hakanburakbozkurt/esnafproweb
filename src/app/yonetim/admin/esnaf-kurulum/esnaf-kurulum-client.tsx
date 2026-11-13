"use client";

import imageCompression from "browser-image-compression";
import { useActionState, useState, useTransition } from "react";
import type { BekleyenKurulum } from "@/app/yonetim/admin/esnaf-kurulum/page";
import {
  adminBtnPrimaryClass,
  adminBtnSecondaryClass,
  adminCheckboxClass,
  adminInputClass,
  adminPanelClass,
} from "@/components/yonetim/admin-ui";
import {
  adminEsnafAdinaDukkanKur,
  adminEsnafDavetYenile,
  adminEsnafFotoYukle,
  type EsnafKurulumState,
} from "@/lib/dukkan/esnaf-adina-actions";
import {
  ESNAF_KURULUM_MAX_GALERI,
  type EsnafKurulumFotoTuru,
} from "@/lib/dukkan/esnaf-adina-kurulum";
import { sanitizeSlugInput } from "@/lib/utils/slug";

const labelClass = "block text-sm font-medium text-zinc-300";

/**
 * Sunucu isteği 1 MB sınırını aşmasın diye fotoğraf yüklemeden önce küçültülür.
 */
async function kucult(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const sonuc = await imageCompression(file, {
      maxSizeMB: 0.7,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      initialQuality: 0.82,
      fileType: "image/webp",
    });
    const ad = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([sonuc], `${ad}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  }
}

function KopyalaButonu({ metin, etiket }: { metin: string; etiket: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  return (
    <button
      type="button"
      className={adminBtnSecondaryClass}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(metin);
          setKopyalandi(true);
          setTimeout(() => setKopyalandi(false), 2000);
        } catch {
          setKopyalandi(false);
        }
      }}
    >
      {kopyalandi ? "Kopyalandı" : etiket}
    </button>
  );
}

function SonucKarti({ sonuc }: { sonuc: NonNullable<EsnafKurulumState["success"]> }) {
  return (
    <section className={`${adminPanelClass} border-emerald-500/40`}>
      <h2 className="text-lg font-bold text-emerald-300">{sonuc.dukkanAdi} hazır</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Mesajı esnafa WhatsApp&apos;tan gönderin. Davet bağlantısı tek kullanımlıktır ve
        yaklaşık 24 saat geçerlidir; süresi dolarsa aşağıdaki listeden yenisini üretin.
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-zinc-500">Mağaza sayfası</dt>
          <dd>
            <a href={sonuc.vitrinUrl} target="_blank" rel="noopener noreferrer" className="break-all text-indigo-300 underline">
              {sonuc.vitrinUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Davet bağlantısı</dt>
          <dd className="break-all text-zinc-300">{sonuc.davetUrl}</dd>
        </div>
      </dl>
      <textarea
        readOnly
        value={sonuc.mesaj}
        rows={8}
        className={`${adminInputClass} mt-4 font-mono text-xs`}
        aria-label="Esnafa gönderilecek mesaj"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={sonuc.whatsappUrl} target="_blank" rel="noopener noreferrer" className={adminBtnPrimaryClass}>
          WhatsApp&apos;ta gönder
        </a>
        <KopyalaButonu metin={sonuc.mesaj} etiket="Mesajı kopyala" />
        <KopyalaButonu metin={sonuc.davetUrl} etiket="Bağlantıyı kopyala" />
      </div>
    </section>
  );
}

type FotoAlaniProps = {
  tur: EsnafKurulumFotoTuru;
  etiket: string;
  slug: string;
  urller: string[];
  setUrller: (urller: string[]) => void;
  max: number;
};

function FotoAlani({ tur, etiket, slug, urller, setUrller, max }: FotoAlaniProps) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function dosyalariYukle(dosyalar: FileList | null) {
    if (!dosyalar?.length) return;
    if (!slug) {
      setHata("Önce dükkan adını ve sayfa adresini yazın.");
      return;
    }
    setHata(null);
    setYukleniyor(true);
    const yeni = [...urller];
    for (const dosya of Array.from(dosyalar).slice(0, max - yeni.length)) {
      const fd = new FormData();
      fd.set("slug", slug);
      fd.set("tur", tur);
      fd.set("file", await kucult(dosya));
      const sonuc = await adminEsnafFotoYukle(fd);
      if ("error" in sonuc) {
        setHata(sonuc.error);
        break;
      }
      yeni.push(sonuc.url);
    }
    setUrller(max === 1 ? yeni.slice(-1) : yeni);
    setYukleniyor(false);
  }

  return (
    <div>
      <span className={labelClass}>
        {etiket} {max > 1 && <span className="text-zinc-500">(en fazla {max})</span>}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {urller.map((url) => (
          <div key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- yalnızca yükleme önizlemesi */}
            <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => setUrller(urller.filter((u) => u !== url))}
              className="absolute -right-2 -top-2 rounded-full bg-zinc-950 px-2 text-xs text-zinc-200"
              aria-label="Fotoğrafı kaldır"
            >
              ×
            </button>
          </div>
        ))}
        {urller.length < max && (
          <label className={`${adminBtnSecondaryClass} h-20 cursor-pointer`}>
            {yukleniyor ? "Yükleniyor…" : "+ Fotoğraf"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple={max > 1}
              className="sr-only"
              disabled={yukleniyor}
              onChange={(e) => {
                void dosyalariYukle(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {hata && <p className="mt-2 text-sm text-red-300">{hata}</p>}
    </div>
  );
}

function BekleyenListe({ bekleyenler, siteUrl }: { bekleyenler: BekleyenKurulum[]; siteUrl: string }) {
  const [sonuc, setSonuc] = useState<EsnafKurulumState | null>(null);
  const [isPending, startTransition] = useTransition();

  if (bekleyenler.length === 0) return null;

  return (
    <section className={adminPanelClass}>
      <h2 className="text-lg font-bold text-zinc-100">Esnafın onayını bekleyenler</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Bu dükkanlar kuruldu ama esnaf henüz giriş yapıp koşulları onaylamadı.
      </p>
      <ul className="mt-4 divide-y divide-zinc-800">
        {bekleyenler.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold text-zinc-100">{d.dukkan_adi}</p>
              <a href={`${siteUrl}/${d.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-300 underline">
                /{d.slug}
              </a>
              <p className="text-xs text-zinc-500">
                {new Date(d.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              className={adminBtnSecondaryClass}
              onClick={() =>
                startTransition(async () => {
                  setSonuc(await adminEsnafDavetYenile(d.id));
                })
              }
            >
              Yeni davet bağlantısı
            </button>
          </li>
        ))}
      </ul>
      {sonuc?.error && <p className="mt-3 text-sm text-red-300">{sonuc.error}</p>}
      {sonuc?.success && (
        <div className="mt-4">
          <SonucKarti sonuc={sonuc.success} />
        </div>
      )}
    </section>
  );
}

export function EsnafKurulumClient({
  bekleyenler,
  siteUrl,
}: {
  bekleyenler: BekleyenKurulum[];
  siteUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(adminEsnafAdinaDukkanKur, {});
  const [dukkanAdi, setDukkanAdi] = useState("");
  const [slug, setSlug] = useState("");
  const [slugElle, setSlugElle] = useState(false);
  const [logo, setLogo] = useState<string[]>([]);
  const [banner, setBanner] = useState<string[]>([]);
  const [galeri, setGaleri] = useState<string[]>([]);

  const etkinSlug = slugElle ? slug : sanitizeSlugInput(dukkanAdi);

  return (
    <div className="space-y-8">
      {state.success && <SonucKarti sonuc={state.success} />}

      <form action={formAction} className={`${adminPanelClass} space-y-6`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Dükkan adı *
            <input
              name="dukkan_adi"
              required
              value={dukkanAdi}
              onChange={(e) => setDukkanAdi(e.target.value)}
              className={adminInputClass}
              placeholder="X Mobile"
            />
          </label>
          <label className={labelClass}>
            Sayfa adresi *
            <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
              <span className="shrink-0">{siteUrl.replace(/^https?:\/\//, "")}/</span>
              <input
                name="slug"
                required
                value={etkinSlug}
                onChange={(e) => {
                  setSlugElle(true);
                  setSlug(sanitizeSlugInput(e.target.value));
                }}
                className={`${adminInputClass} mt-0`}
                placeholder="xmobile"
              />
            </div>
          </label>
          <label className={labelClass}>
            Esnafın e-postası *
            <input name="email" type="email" required className={adminInputClass} placeholder="esnaf@gmail.com" />
            <span className="mt-1 block text-xs text-zinc-500">Esnaf bu e-posta ve kendi belirleyeceği şifreyle giriş yapar.</span>
          </label>
          <label className={labelClass}>
            Telefon
            <input name="telefon" type="tel" className={adminInputClass} placeholder="0555 123 45 67" />
          </label>
          <label className={labelClass}>
            WhatsApp
            <input name="whatsapp" type="tel" className={adminInputClass} placeholder="Boşsa telefon kullanılır" />
          </label>
          <label className={labelClass}>
            Instagram
            <input name="instagram_url" className={adminInputClass} placeholder="@kullaniciadi" />
          </label>
          <label className={labelClass}>
            Şehir
            <input name="sehir" className={adminInputClass} placeholder="Diyarbakır" />
          </label>
          <label className={labelClass}>
            Semt / ilçe
            <input name="semt" className={adminInputClass} placeholder="Bağlar" />
            <span className="mt-1 block text-xs text-zinc-500">Google&apos;da yerel aramalarda çıkmak için önemli.</span>
          </label>
        </div>

        <label className={labelClass}>
          Açık adres
          <input name="adres" className={adminInputClass} placeholder="Mahalle, cadde, no" />
        </label>

        <label className={labelClass}>
          Açıklama
          <textarea
            name="aciklama"
            rows={4}
            className={adminInputClass}
            placeholder="Boş bırakırsanız dükkan adı, semt ve hizmetlerden otomatik bir tanıtım yazılır."
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" name="teknik_servis_aktif" className={adminCheckboxClass} />
          Teknik servis (tamir) hizmeti veriyor
        </label>

        <div className="grid gap-6 sm:grid-cols-3">
          <FotoAlani tur="logo" etiket="Logo" slug={etkinSlug} urller={logo} setUrller={setLogo} max={1} />
          <FotoAlani tur="banner" etiket="Kapak fotoğrafı" slug={etkinSlug} urller={banner} setUrller={setBanner} max={1} />
          <FotoAlani
            tur="galeri"
            etiket="Dükkan fotoğrafları"
            slug={etkinSlug}
            urller={galeri}
            setUrller={setGaleri}
            max={ESNAF_KURULUM_MAX_GALERI}
          />
        </div>
        <input type="hidden" name="logo_url" value={logo[0] ?? ""} />
        <input type="hidden" name="banner_url" value={banner[0] ?? ""} />
        {galeri.map((url) => (
          <input key={url} type="hidden" name="dukkan_fotograflari" value={url} />
        ))}

        {state.error && (
          <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className={adminBtnPrimaryClass}>
          {isPending ? "Kuruluyor…" : "Dükkanı kur ve davet bağlantısı üret"}
        </button>
      </form>

      <BekleyenListe bekleyenler={bekleyenler} siteUrl={siteUrl} />
    </div>
  );
}
