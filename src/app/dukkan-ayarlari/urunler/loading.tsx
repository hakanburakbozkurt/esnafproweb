export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl animate-pulse space-y-5 px-4 py-10 motion-reduce:animate-none sm:px-6"
      aria-busy="true"
      aria-label="Ürünler yükleniyor"
    >
      <div className="h-8 w-56 rounded-full bg-slate-200" />
      <div className="h-[4.5rem] rounded-3xl bg-slate-100" />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
            <div className="aspect-square bg-slate-100" />
            <div className="space-y-2 p-3.5">
              <div className="h-3 w-16 rounded-full bg-slate-100" />
              <div className="h-4 w-4/5 rounded-full bg-slate-200" />
              <div className="h-4 w-1/3 rounded-full bg-slate-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
