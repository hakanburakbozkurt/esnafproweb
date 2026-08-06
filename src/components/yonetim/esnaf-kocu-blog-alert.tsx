"use client";

import Link from "next/link";
import {
  yonetimCoachPanelClass,
  yonetimPanelAccentLabelClass,
  yonetimPanelCtaClass,
  yonetimPanelPaddingClass,
} from "@/lib/yonetim/gradient-panel";

export function EsnafKocuBlogAlert() {
  return (
    <div className={yonetimCoachPanelClass}>
      <div className={yonetimPanelPaddingClass}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className={yonetimPanelAccentLabelClass}>Esnaf Koçu</p>
            <p className="mt-2 text-base leading-relaxed text-slate-700 sm:text-lg">
              💡{" "}
              <span className="font-semibold text-slate-900">Esnaf Koçu:</span> Dükkanın
              için henüz hiç blog yazısı eklemedin. Bölgesindeki müşterilerin seni
              Google ve yerel aramalarda daha rahat bulması için ilk yazını hemen
              oluşturabilirsin!
            </p>
          </div>

          <Link href="/yonetim/blog/yeni" className={yonetimPanelCtaClass}>
            İlk Yazımı Ekle
          </Link>
        </div>
      </div>
    </div>
  );
}
