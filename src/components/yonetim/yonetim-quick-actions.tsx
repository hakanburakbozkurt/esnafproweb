"use client";

import { Check, PackagePlus, Share2, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getPublicSiteUrl } from "@/lib/auth/site-url";
import { logDukkanAction } from "@/lib/dukkan/logger";
import { cn } from "@/lib/utils/cn";

const cardClass =
  "group flex h-full min-h-[8.5rem] w-full flex-col justify-between rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5";

function CardBody({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "primary" | "default";
}) {
  return (
    <>
      <span
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-2xl",
          tone === "primary" ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-600"
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="mt-4 block">
        <span
          className={cn(
            "block text-base font-bold",
            tone === "primary" ? "text-white" : "text-slate-900"
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-xs leading-snug",
            tone === "primary" ? "text-emerald-50/90" : "text-slate-500"
          )}
        >
          {description}
        </span>
      </span>
    </>
  );
}

export function YonetimQuickActions({
  shopSlug,
  shopName,
}: {
  shopSlug: string;
  shopName: string;
}) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");
  const vitrinUrl = `${getPublicSiteUrl()}/${shopSlug}`;

  async function handleShare() {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: shopName, text: `${shopName} dijital vitrini`, url: vitrinUrl });
        return;
      }
      await navigator.clipboard.writeText(vitrinUrl);
      setShareState("copied");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      logDukkanAction("vitrinPaylas", "share failed", { err });
      setShareState("error");
    }
  }

  return (
    <section aria-labelledby="hizli-islemler-baslik">
      <h2
        id="hizli-islemler-baslik"
        className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-500"
      >
        Hızlı işlemler
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <li className="col-span-2 sm:col-span-1">
          <Link
            href="/dukkan-ayarlari/urunler"
            className={cn(
              cardClass,
              "border-emerald-600 bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
            )}
          >
            <CardBody
              icon={PackagePlus}
              title="Ürün ekle"
              description="Fotoğraf, fiyat ve stokla vitrine ekleyin"
              tone="primary"
            />
          </Link>
        </li>
        <li>
          <Link
            href="/yonetim/servis"
            className={cn(cardClass, "border-slate-200/80 bg-white hover:border-emerald-200")}
          >
            <CardBody
              icon={Wrench}
              title="Servis kayıtları"
              description="Ara, durumları takip et"
              tone="default"
            />
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => void handleShare()}
            className={cn(cardClass, "border-slate-200/80 bg-white hover:border-emerald-200")}
            aria-describedby={shareState === "error" ? "vitrin-paylas-hata" : undefined}
          >
            <CardBody
              icon={shareState === "copied" ? Check : Share2}
              title={shareState === "copied" ? "Bağlantı kopyalandı" : "Vitrini paylaş"}
              description={`/${shopSlug}`}
              tone="default"
            />
          </button>
        </li>
      </ul>
      {shareState === "error" && (
        <p id="vitrin-paylas-hata" role="alert" className="mt-2 text-xs text-red-600">
          Bağlantı paylaşılamadı. Vitrin adresiniz: {vitrinUrl}
        </p>
      )}
    </section>
  );
}
