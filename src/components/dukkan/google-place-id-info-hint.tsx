type GoogleMapsManualInputHintProps = {
  visible?: boolean;
};

export function GoogleMapsManualInputHint({
  visible = true,
}: GoogleMapsManualInputHintProps) {
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
        <p className="font-semibold text-sky-900">Google Maps bağlantısı nasıl alınır?</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-sky-900/80">
          <li>Google Maps&apos;te işletmenizi açın.</li>
          <li>&quot;Paylaş&quot; → &quot;Linki kopyala&quot; ile tam URL&apos;yi alın.</li>
          <li>
            Alternatif: Place ID&apos;niz varsa doğrudan{" "}
            <span className="font-mono text-xs">ChIJ...</span> formatında yapıştırın.
          </li>
        </ol>
        <p className="mt-2 text-xs text-sky-800/80">
          API anahtarı gerekmez; link veya Place ID kaydedilir ve vitrin yorumları için
          kullanılır.
        </p>
      </div>
    </div>
  );
}
