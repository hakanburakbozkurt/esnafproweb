"use client";

import { useMemo, useState, useTransition } from "react";
import {
  fetchTamirFiyatlari,
  fetchTamirKategorileri,
  fetchTamirModelleri,
} from "@/lib/tamir-fiyati/tamir-fiyati-actions";
import { formatTamirPrice } from "@/lib/tamir-fiyati/tamir-fiyati-queries";
import type { TamirFiyati, TamirMarkasi } from "@/types/database.types";
import type { TamirModelOption } from "@/lib/tamir-fiyati/tamir-fiyati-queries";
import { cn } from "@/lib/utils/cn";

type Step = 1 | 2 | 3 | 4;

export function TamirFiyatiWizard({ brands }: { brands: TamirMarkasi[] }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedBrand, setSelectedBrand] = useState<TamirMarkasi | null>(null);
  const [models, setModels] = useState<TamirModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<TamirModelOption | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prices, setPrices] = useState<TamirFiyati[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const groupedModels = useMemo(() => {
    const groups = new Map<string, TamirModelOption[]>();
    for (const model of models) {
      const key = model.seri_name || "Diğer";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(model);
    }
    return [...groups.entries()];
  }, [models]);

  function resetFromStep(nextStep: Step) {
    setStep(nextStep);
    setError(null);
    if (nextStep <= 1) {
      setSelectedBrand(null);
      setModels([]);
      setSelectedModel(null);
      setCategories([]);
      setSelectedCategory(null);
      setPrices([]);
    } else if (nextStep <= 2) {
      setSelectedModel(null);
      setCategories([]);
      setSelectedCategory(null);
      setPrices([]);
    } else if (nextStep <= 3) {
      setSelectedCategory(null);
      setPrices([]);
    }
  }

  function handleBrandSelect(brand: TamirMarkasi) {
    setSelectedBrand(brand);
    setError(null);
    startTransition(async () => {
      const nextModels = await fetchTamirModelleri(brand.slug);
      if (!nextModels.length) {
        setError("Bu marka için henüz model eklenmemiş.");
        return;
      }
      setModels(nextModels);
      setStep(2);
    });
  }

  function handleModelSelect(model: TamirModelOption) {
    setSelectedModel(model);
    setError(null);
    startTransition(async () => {
      const nextCategories = await fetchTamirKategorileri(model.id);
      if (!nextCategories.length) {
        setError("Bu model için tamir kategorisi bulunamadı.");
        return;
      }
      setCategories(nextCategories);
      setStep(3);
    });
  }

  function handleCategorySelect(category: string) {
    if (!selectedModel) return;
    setSelectedCategory(category);
    setError(null);
    startTransition(async () => {
      const nextPrices = await fetchTamirFiyatlari(selectedModel.id, category);
      if (!nextPrices.length) {
        setError("Bu kategori için fiyat bulunamadı.");
        return;
      }
      setPrices(nextPrices);
      setStep(4);
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <StepIndicator current={step} />

      {error && (
        <p className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {isPending && (
        <p className="mb-4 text-center text-sm text-slate-500">Yükleniyor…</p>
      )}

      {step === 1 && (
        <section>
          <SectionTitle
            title="Marka seçin"
            description="Cihazınızın markasını seçerek devam edin."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {brands.map((brand) => (
              <ChoiceButton
                key={brand.id}
                label={brand.name}
                active={selectedBrand?.id === brand.id}
                disabled={isPending}
                onClick={() => handleBrandSelect(brand)}
              />
            ))}
          </div>
          {!brands.length && (
            <EmptyHint text="Henüz marka eklenmemiş. Veritabanı seed dosyasını Supabase'e uygulayın." />
          )}
        </section>
      )}

      {step === 2 && selectedBrand && (
        <section>
          <SectionTitle
            title="Model seçin"
            description={`${selectedBrand.name} cihazınızın modelini seçin.`}
          />
          <div className="space-y-5">
            {groupedModels.map(([seriName, seriModels]) => (
              <div key={seriName}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  {seriName}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {seriModels.map((model) => (
                    <ChoiceButton
                      key={model.id}
                      label={model.name}
                      active={selectedModel?.id === model.id}
                      disabled={isPending}
                      onClick={() => handleModelSelect(model)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <BackButton onClick={() => resetFromStep(1)} />
        </section>
      )}

      {step === 3 && selectedModel && (
        <section>
          <SectionTitle
            title="Tamir türü seçin"
            description={`${selectedModel.name} için hangi işlemi yaptırmak istiyorsunuz?`}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <ChoiceButton
                key={category}
                label={category}
                active={selectedCategory === category}
                disabled={isPending}
                onClick={() => handleCategorySelect(category)}
              />
            ))}
          </div>
          <BackButton onClick={() => resetFromStep(2)} />
        </section>
      )}

      {step === 4 && selectedModel && selectedCategory && (
        <section>
          <SectionTitle
            title="Referans fiyatlar"
            description={`${selectedModel.name} · ${selectedCategory}`}
          />
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <ul className="divide-y divide-slate-100">
              {prices.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{item.service_name}</p>
                    {item.description && (
                      <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-lg font-extrabold text-emerald-700">
                    {formatTamirPrice(item.price)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Fiyatlar referans amaçlıdır. Kesin teklif için yetkili servis noktası ile iletişime geçin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <BackButton onClick={() => resetFromStep(3)} />
            <button
              type="button"
              onClick={() => resetFromStep(1)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Baştan başla
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const labels = ["Marka", "Model", "Tamir", "Fiyat"];
  return (
    <ol className="mb-8 grid grid-cols-4 gap-2">
      {labels.map((label, index) => {
        const stepNumber = (index + 1) as Step;
        const active = current === stepNumber;
        const done = current > stepNumber;
        return (
          <li
            key={label}
            className={cn(
              "rounded-xl border px-2 py-3 text-center text-[11px] font-semibold sm:text-xs",
              active && "border-emerald-300 bg-emerald-50 text-emerald-700",
              done && "border-emerald-100 bg-emerald-50/60 text-emerald-600",
              !active && !done && "border-slate-200 bg-slate-50 text-slate-400"
            )}
          >
            <span className="block text-[10px] uppercase tracking-wide opacity-70">
              {stepNumber}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-5 text-center">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </header>
  );
}

function ChoiceButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
        active
          ? "border-emerald-400 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      {label}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
    >
      Geri
    </button>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}
