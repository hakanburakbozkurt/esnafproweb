"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect } from "react";
import {
  getUrunAspectClass,
  type UrunGorselOrani,
} from "@/lib/dukkan/urun-gorsel-orani";
import { cn } from "@/lib/utils/cn";

type AutoScrollCarouselProps = {
  images: string[];
  altPrefix: string;
  gorselOrani?: UrunGorselOrani | string | null;
  className?: string;
  slideClassName?: string;
  autoplayDelay?: number;
};

export function AutoScrollCarousel({
  images,
  altPrefix,
  gorselOrani = "yatay",
  className,
  slideClassName,
  autoplayDelay = 3800,
}: AutoScrollCarouselProps) {
  const aspectClass = getUrunAspectClass(gorselOrani);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: images.length > 1,
      align: "start",
      dragFree: false,
    },
    [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    ]
  );

  useEffect(() => {
    if (!emblaApi || images.length <= 1) return;
    emblaApi.plugins()?.autoplay?.play();
  }, [emblaApi, images.length]);

  if (!images.length) return null;

  const frameClass = cn(
    aspectClass,
    "w-full overflow-hidden rounded-xl bg-slate-100",
    className
  );

  const imgClass = "h-full w-full object-cover object-center";

  if (images.length === 1) {
    return (
      <div className={frameClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={`${altPrefix} 1`}
          className={imgClass}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={frameClass} ref={emblaRef}>
      <div className="flex h-full">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={cn("min-w-0 shrink-0 grow-0 basis-full", slideClassName)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${altPrefix} ${index + 1}`}
              className={imgClass}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
