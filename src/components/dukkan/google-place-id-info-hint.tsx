type GooglePlaceIdInfoHintProps = {
  visible?: boolean;
};

export function GooglePlaceIdInfoHint({ visible = true }: GooglePlaceIdInfoHintProps) {
  if (!visible) return null;

  return (
    <div
      className="mb-4 flex gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3.5"
      role="note"
    >
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-sky-600 ring-1 ring-sky-100"
        aria-hidden
      >
        i
      </span>
      <div className="text-sm leading-relaxed text-sky-950/90">
        <p className="font-semibold text-sky-900">Google Place ID gerekli</p>
        <p className="mt-1 text-sky-900/85">
          Vitrinde Google yorumlarını göstermek için İşletme Profilinizin Place ID
          değerini eklemeniz gerekir.
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sky-900/80">
          <li>Google Maps&apos;te işletmenizi açın.</li>
          <li>İşletme adına tıklayıp &quot;Paylaş&quot; veya profil detayına girin.</li>
          <li>
            Place ID&apos;yi{" "}
            <a
              href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Place ID Finder
            </a>{" "}
            aracından veya profil bağlantısından kopyalayın.
          </li>
          <li>Aşağıdaki alana <span className="font-mono">ChIJ...</span> formatında yapıştırın.</li>
        </ol>
      </div>
    </div>
  );
}
