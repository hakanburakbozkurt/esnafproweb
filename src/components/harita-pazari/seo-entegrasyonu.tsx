"use client";

import { AnimatePresence } from "framer-motion";
import { MessageSquareHeart, Newspaper } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProfileHealthScore } from "@/components/dukkan/profile-health-score";
import { ProfileHealthSheet } from "@/components/yonetim/profile-health-sheet";
import type { ProfileHealthInput } from "@/lib/dukkan/profile-health-score";
import type { HaritaPazariRaporu } from "@/lib/harita-pazari/rapor";

export function SeoEntegrasyonu({
  healthInput,
  yorumHedefi,
}: {
  healthInput: ProfileHealthInput;
  yorumHedefi: HaritaPazariRaporu["yorumHedefi"];
}) {
  const [dokumAcik, setDokumAcik] = useState(false);
  const blogAz = (healthInput.blogPostCount ?? 0) < 3;

  return (
    <section aria-labelledby="seo-entegrasyon-baslik" className="space-y-4">
      <h2 id="seo-entegrasyon-baslik" className="text-lg font-bold text-slate-900">
        SEO skoru ve harita sıran
      </h2>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
        <ProfileHealthScore input={healthInput} onOpenDetails={() => setDokumAcik(true)} />

        <ul className="space-y-3">
          {yorumHedefi && (
            <li className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
              <MessageSquareHeart className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
              <p className="text-sm leading-relaxed text-slate-700">
                İlk 3 rakibinin ortalaması{" "}
                <strong className="text-slate-900">
                  {yorumHedefi.rakipOrtalamasi.toLocaleString("tr-TR")} yorum
                </strong>
                . Yaklaşık{" "}
                <strong className="text-slate-900">{yorumHedefi.eksik.toLocaleString("tr-TR")} yorum</strong>{" "}
                daha toplarsan yorum sayısında onlara yetişirsin. Yorum sayısı ve puan, Google
                Haritalar sıralamasını etkileyen en güçlü sinyallerdendir.
              </p>
            </li>
          )}
          {blogAz && (
            <li className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
              <Newspaper className="mt-0.5 size-5 shrink-0 text-sky-600" aria-hidden />
              <p className="text-sm leading-relaxed text-slate-700">
                Bölgene özel blog yazıları (ör. “Kadıköy&apos;de ekran değişimi”) yerel aramalarda
                görünürlüğünü artırır.{" "}
                <Link href="/yonetim/blog/yeni" className="font-semibold text-emerald-700 hover:underline">
                  Yeni yazı ekle
                </Link>
              </p>
            </li>
          )}
          {!yorumHedefi && !blogAz && (
            <li className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm text-slate-700">
              Yorum ve içerikte rakiplerinle başa baş gidiyorsun. Skor dökümündeki eksik maddeleri
              tamamlayarak farkı aç.
            </li>
          )}
        </ul>
      </div>

      <AnimatePresence>
        {dokumAcik && <ProfileHealthSheet input={healthInput} onClose={() => setDokumAcik(false)} />}
      </AnimatePresence>
    </section>
  );
}
