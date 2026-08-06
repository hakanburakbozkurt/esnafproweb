"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ServiceTrackForm({
  slug,
  teknikServisPage = false,
}: {
  slug: string;
  teknikServisPage?: boolean;
}) {
  const router = useRouter();
  const [deviceCode, setDeviceCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = deviceCode.trim().toUpperCase();

    if (!code) {
      setError("Lütfen takip kodunuzu girin.");
      return;
    }

    setError(null);
    router.push(`/servis-takip/${encodeURIComponent(code)}`);
  }

  const inlineBase = teknikServisPage
    ? `/${slug}/teknik-servis`
    : `/${slug}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="device-code" className="block text-sm font-medium text-slate-700">
        Takip kodunuz
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="device-code"
          name="device_code"
          type="text"
          value={deviceCode}
          onChange={(event) => setDeviceCode(event.target.value)}
          placeholder="Örn. ABC123"
          autoComplete="off"
          className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Sorgula
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        QR kod ile geldiseniz aynı kodu girerek sayfada özel servis görünümünü
        açabilirsiniz.{" "}
        <button
          type="button"
          onClick={() => {
            const code = deviceCode.trim().toUpperCase();
            if (!code) {
              setError("Lütfen takip kodunuzu girin.");
              return;
            }
            setError(null);
            router.push(
              `${inlineBase}?servis=${encodeURIComponent(code)}#qr-servis`
            );
          }}
          className="font-medium text-emerald-600 underline-offset-2 hover:underline"
        >
          Bu sayfada göster
        </button>
      </p>
    </form>
  );
}
