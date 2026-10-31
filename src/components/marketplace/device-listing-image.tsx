import { KartGorseli } from "@/components/ui/kart-gorseli";
import { cn } from "@/lib/utils/cn";

type DeviceListingImageProps = {
  src: string | null;
  alt: string;
  aspect?: "square" | "4/3";
  className?: string;
  imgClassName?: string;
  /** Mobilde kart solunda küçük (112px), geniş ekranda kart genişliği */
  sizes?: string;
};

export function DeviceListingImage({
  src,
  alt,
  aspect = "4/3",
  className,
  imgClassName,
  sizes = "(max-width: 640px) 112px, 320px",
}: DeviceListingImageProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-slate-100",
        aspect === "square" ? "aspect-square" : "aspect-[4/3]",
        className
      )}
    >
      {src ? (
        <KartGorseli
          src={src}
          alt={alt}
          sizes={sizes}
          className={cn("object-contain p-2 sm:p-3", imgClassName)}
        />
      ) : (
        <span className="text-xs text-slate-400 sm:text-sm">Görsel yok</span>
      )}
    </div>
  );
}
