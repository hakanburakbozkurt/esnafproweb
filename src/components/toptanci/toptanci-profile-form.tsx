"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify, sanitizeSlugInput } from "@/lib/utils/slug";
import { validateDukkanAdi, validateSlug } from "@/lib/utils/reserved-slugs";
import { cn } from "@/lib/utils/cn";
import type { Toptanci } from "@/types/database.types";

export function ToptanciProfileForm({
  action,
  submitLabel,
  pendingLabel,
  error,
  success,
  isPending,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  pendingLabel: string;
  error?: string;
  success?: boolean;
  isPending: boolean;
  defaultValues?: Partial<Toptanci>;
}) {
  const [firmaAdi, setFirmaAdi] = useState(defaultValues?.firma_adi ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [unvan, setUnvan] = useState(defaultValues?.unvan ?? "");
  const [adres, setAdres] = useState(defaultValues?.adres ?? "");
  const [telefon, setTelefon] = useState(defaultValues?.telefon ?? "");

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(firmaAdi));
    }
  }, [firmaAdi, slugTouched]);

  const firmaError = useMemo(() => {
    if (!firmaAdi.trim()) return null;
    return validateDukkanAdi(firmaAdi);
  }, [firmaAdi]);

  const slugValidationError = useMemo(() => {
    if (!slug.trim()) return null;
    return validateSlug(slug);
  }, [slug]);

  const hasBlockingError = Boolean(firmaError || slugValidationError);

  return (
    <Card className="w-full">
      <form action={action} className="space-y-5">
        <Field
          label="Firma / Ticaret Unvanı (Görünen Ad)"
          hint="Esnaf ağında görünecek firma adı"
        >
          <Input
            name="firma_adi"
            required
            value={firmaAdi}
            onChange={(event) => setFirmaAdi(event.target.value)}
            placeholder="Örn: Mega GSM Toptan"
          />
          {firmaError && (
            <p className="mt-1.5 text-xs text-red-600">{firmaError}</p>
          )}
        </Field>

        <Field
          label="URL Slug"
          hint={`Adresiniz: esnafpro.com/${slug || "firma-slug"}`}
        >
          <Input
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(sanitizeSlugInput(event.target.value));
            }}
            placeholder="mega-gsm-toptan"
            className={cn("font-mono")}
          />
          {slugValidationError && (
            <p className="mt-1.5 text-xs text-red-600">{slugValidationError}</p>
          )}
        </Field>

        <Field label="Resmi Firma Unvanı">
          <Input
            name="unvan"
            required
            value={unvan}
            onChange={(event) => setUnvan(event.target.value)}
            placeholder="Örn: Mega GSM Ticaret Ltd. Şti."
          />
        </Field>

        <Field label="Adres">
          <Textarea
            name="adres"
            required
            rows={3}
            value={adres}
            onChange={(event) => setAdres(event.target.value)}
            placeholder="Mahalle, ilçe, il"
          />
        </Field>

        <Field label="Telefon" hint="İsteğe bağlı">
          <Input
            name="telefon"
            value={telefon}
            onChange={(event) => setTelefon(event.target.value)}
            placeholder="05XX XXX XX XX"
          />
        </Field>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Profil bilgileriniz güncellendi.
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending || hasBlockingError}
          className="w-full"
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
