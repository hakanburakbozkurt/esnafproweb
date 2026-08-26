/** Blog kartları için ortak kapak görseli — kırpmadan sığdırır */
export function BlogCardCover({
  src,
  alt,
  placeholder = "Esnaf Rehberi",
}: {
  src?: string | null;
  alt: string;
  placeholder?: string;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-emerald-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {placeholder}
        </div>
      )}
    </div>
  );
}
