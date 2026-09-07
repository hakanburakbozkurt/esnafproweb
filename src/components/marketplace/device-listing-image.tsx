import { cn } from "@/lib/utils/cn";

type DeviceListingImageProps = {
  src: string | null;
  alt: string;
  aspect?: "square" | "4/3";
  className?: string;
  imgClassName?: string;
};

export function DeviceListingImage({
  src,
  alt,
  aspect = "4/3",
  className,
  imgClassName,
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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className={cn(
            "max-h-full max-w-full object-contain p-2 sm:p-3",
            imgClassName
          )}
        />
      ) : (
        <span className="text-xs text-slate-400 sm:text-sm">Görsel yok</span>
      )}
    </div>
  );
}
