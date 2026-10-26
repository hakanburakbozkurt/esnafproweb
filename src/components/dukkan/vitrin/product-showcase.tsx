"use client";

import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { UrunDetayModal } from "@/components/dukkan/vitrin/urun-detay-modal";
import { UrunKategoriSeridi } from "@/components/dukkan/vitrin/urun-kategori-seridi";
import {
  VitrinDotGrid,
  vitrinSectionLabelClass,
} from "@/components/dukkan/vitrin/vitrin-open-section";
import { groupUrunlerByKategori, URUN_QUERY_PARAM } from "@/lib/dukkan/group-urunler";
import type { Dukkan, DukkanUrunu } from "@/types/database.types";

type ShowcaseDukkan = Pick<Dukkan, "slug" | "dukkan_adi" | "whatsapp" | "telefon">;

function buildSearch(params: URLSearchParams): string {
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
}

export function ProductShowcaseSection({
  urunler,
  dukkan,
}: {
  urunler: DukkanUrunu[];
  dukkan: ShowcaseDukkan;
}) {
  const searchParams = useSearchParams();
  const groups = useMemo(() => groupUrunlerByKategori(urunler), [urunler]);
  const openId = searchParams?.get(URUN_QUERY_PARAM) ?? null;
  const openUrun = openId ? (urunler.find((urun) => urun.id === openId) ?? null) : null;

  const pushedRef = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openDetail = useCallback((urun: DukkanUrunu) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    const params = new URLSearchParams(window.location.search);
    params.set(URUN_QUERY_PARAM, urun.id);
    window.history.pushState(null, "", buildSearch(params));
    pushedRef.current = true;
  }, []);

  const closeDetail = useCallback(() => {
    const trigger = triggerRef.current;
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      const params = new URLSearchParams(window.location.search);
      params.delete(URUN_QUERY_PARAM);
      window.history.replaceState(null, "", buildSearch(params));
    }
    requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
  }, []);

  const titledGroups = groups.filter((group) => group.title);

  return (
    <section id="urunler" className="relative">
      <VitrinDotGrid />

      <ScrollReveal>
        <p className={vitrinSectionLabelClass}>Ürün & Hizmetler</p>
      </ScrollReveal>

      {titledGroups.length > 1 && (
        <nav
          aria-label="Ürün kategorileri"
          className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {titledGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {group.title}
              <span className="text-xs font-medium text-slate-400">{group.urunler.length}</span>
            </a>
          ))}
        </nav>
      )}

      <div className="space-y-10 lg:space-y-14">
        {groups.map((group, index) => (
          <ScrollReveal key={group.id} delay={Math.min(index, 4) * 0.04}>
            <UrunKategoriSeridi group={group} onOpen={openDetail} />
          </ScrollReveal>
        ))}
      </div>

      <AnimatePresence>
        {openUrun && (
          <UrunDetayModal
            key={openUrun.id}
            urun={openUrun}
            dukkan={dukkan}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
