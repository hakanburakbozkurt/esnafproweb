import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buildBizKuralimUrl } from "@/lib/site/biz-kuralim";
import { cn } from "@/lib/utils/cn";

/** Hangi butondan mesaj geldiğini ekip görebilsin diye mesajın sonuna eklenir. */
export type BizKuralimKaynak = "ana sayfa" | "ana sayfa alt" | "kayıt" | "mağaza aç";

export function BizKuralimButton({
  kaynak,
  className,
  children = "Uğraşma, sayfanı biz kuralım",
}: {
  kaynak: BizKuralimKaynak;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={buildBizKuralimUrl(kaynak)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-emerald-600 bg-white px-6 py-3 text-center text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 sm:text-base",
        className
      )}
    >
      <WhatsAppIcon className="size-5 shrink-0" />
      {children}
    </a>
  );
}

/** Form sayfalarının üstündeki kısa teklif kutusu. */
export function BizKuralimKutusu({ kaynak }: { kaynak: BizKuralimKaynak }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-relaxed text-emerald-900">
        <span className="font-semibold">Formla uğraşmak istemiyor musun?</span> Bilgilerini ve
        fotoğraflarını WhatsApp&apos;tan gönder, sayfanı ücretsiz olarak biz kuralım.
      </p>
      <BizKuralimButton kaynak={kaynak} className="w-full shrink-0 sm:w-auto">
        WhatsApp&apos;tan gönder
      </BizKuralimButton>
    </div>
  );
}

/** Ana sayfada SSS'den önceki son hatırlatma. */
export function BizKuralimSection() {
  return (
    <section className="px-4 py-16 md:py-20" aria-labelledby="biz-kuralim-baslik">
      <div className="mx-auto max-w-4xl rounded-3xl bg-emerald-600 px-6 py-10 text-center text-white sm:px-10 sm:py-12">
        <h2 id="biz-kuralim-baslik" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Vaktin yok mu? Sayfanı biz kuralım.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-emerald-50">
          Dükkanının adını, adresini ve birkaç fotoğrafını WhatsApp&apos;tan gönder. Sayfanı
          hazırlayıp bağlantısını sana yollayalım; beğenirsen tek tıkla onaylarsın. Ücretsiz.
        </p>
        <BizKuralimButton
          kaynak="ana sayfa alt"
          className="mt-6 w-full border-white bg-white sm:w-auto"
        >
          Bilgilerimi WhatsApp&apos;tan gönder
        </BizKuralimButton>
      </div>
    </section>
  );
}
