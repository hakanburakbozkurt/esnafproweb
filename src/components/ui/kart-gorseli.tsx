import Image from "next/image";
import { optimizeEdilebilirGorsel } from "@/lib/utils/gorsel-optimizasyon";
import { cn } from "@/lib/utils/cn";

type KartGorseliProps = {
  src: string;
  alt: string;
  /** Kartın ekranda kapladığı genişlik; tarayıcı buna uygun küçük kopyayı indirir */
  sizes: string;
  className?: string;
  /** İlk ekranda görünen görseller için true */
  oncelikli?: boolean;
  "aria-hidden"?: boolean;
};

/**
 * Liste ve kart görselleri. Kendi depolamamızdaki görseller kart boyutunda
 * küçültülmüş (webp) olarak gelir; diğer adresler olduğu gibi gösterilir.
 * Ebeveyn `relative` olmalı ve boyutu belli olmalı (görsel alanı doldurur).
 */
export function KartGorseli({ src, alt, sizes, className, oncelikli = false, ...rest }: KartGorseliProps) {
  const ortak = cn("absolute inset-0 h-full w-full", className);

  if (optimizeEdilebilirGorsel(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={oncelikli}
        loading={oncelikli ? undefined : "lazy"}
        className={ortak}
        aria-hidden={rest["aria-hidden"]}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={oncelikli ? "eager" : "lazy"}
      className={ortak}
      aria-hidden={rest["aria-hidden"]}
    />
  );
}
