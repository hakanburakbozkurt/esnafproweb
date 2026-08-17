"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import { TamirChoiceCard } from "@/components/tamir-fiyati/tamir-choice-card";
import { TamirPricePanel } from "@/components/tamir-fiyati/tamir-price-panel";
import {
  fetchTamirFiyatlariByModel,
  fetchTamirModelleri,
} from "@/lib/tamir-fiyati/tamir-fiyati-actions";
import {
  getTamirBrandIconSources,
  getTamirModelIconSources,
} from "@/lib/tamir-fiyati/tamir-fiyati-icons";
import type { TamirModelOption } from "@/lib/tamir-fiyati/tamir-fiyati-queries";
import type { TamirFiyati, TamirMarkasi } from "@/types/database.types";
import { cn } from "@/lib/utils/cn";

type View = "brands" | "models" | "prices";

const viewMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function TamirFiyatiWizard({ brands }: { brands: TamirMarkasi[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [view, setView] = useState<View>("brands");
  const [selectedBrand, setSelectedBrand] = useState<TamirMarkasi | null>(null);
  const [models, setModels] = useState<TamirModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<TamirModelOption | null>(
    null
  );
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

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

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
      setSelectedModel(null);
      setPrices([]);
      setView("models");
    });
  }

  function handleModelSelect(model: TamirModelOption) {
    setSelectedModel(model);
    setError(null);
    startTransition(async () => {
      const nextPrices = await fetchTamirFiyatlariByModel(model.id);
      if (!nextPrices.length) {
        setError("Bu model için fiyat listesi bulunamadı.");
        return;
      }
      setPrices(nextPrices);
      setView("prices");
    });
  }

  function goToBrands() {
    setView("brands");
    setSelectedBrand(null);
    setModels([]);
    setSelectedModel(null);
    setPrices([]);
    setError(null);
  }

  function goToModels() {
    setView("models");
    setSelectedModel(null);
    setPrices([]);
    setError(null);
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <TamirBreadcrumb
        brand={selectedBrand}
        model={selectedModel}
        view={view}
        onBrandClick={view !== "brands" ? goToBrands : undefined}
        onModelClick={view === "prices" ? goToModels : undefined}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}

      {isPending && (
        <div className="mb-5 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
          Yükleniyor…
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "brands" && (
          <motion.section
            key="brands"
            {...viewMotion}
            transition={transition}
          >
            <p className="mx-auto mb-8 max-w-md text-center text-lg leading-relaxed text-slate-500 sm:mb-10 sm:text-xl">
              Tamir ve fiyat bilgisi için lütfen cihaz markanızı seçin
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {brands.map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ...transition,
                    delay: prefersReducedMotion ? 0 : index * 0.03,
                  }}
                >
                  <TamirChoiceCard
                    label={brand.name}
                    sources={getTamirBrandIconSources(
                      brand.slug,
                      brand.image_url
                    )}
                    showLabel={false}
                    disabled={isPending}
                    onClick={() => handleBrandSelect(brand)}
                  />
                </motion.div>
              ))}
            </div>
            {!brands.length && (
              <EmptyHint text="Henüz marka eklenmemiş. Veritabanı seed dosyasını Supabase'e uygulayın." />
            )}
          </motion.section>
        )}

        {view === "models" && selectedBrand && (
          <motion.section
            key="models"
            {...viewMotion}
            transition={transition}
            className="space-y-6"
          >
            <div className="space-y-8">
              {groupedModels.map(([seriName, seriModels]) => (
                <div key={seriName}>
                  <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600/90">
                    {seriName}
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    {seriModels.map((model) => (
                      <TamirChoiceCard
                        key={model.id}
                        label={model.name}
                        sources={getTamirModelIconSources(
                          model.slug,
                          model.image_url
                        )}
                        disabled={isPending}
                        onClick={() => handleModelSelect(model)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <WizardNav onBack={goToBrands} backLabel="Markalara dön" />
          </motion.section>
        )}

        {view === "prices" && selectedBrand && selectedModel && (
          <motion.section
            key="prices"
            {...viewMotion}
            transition={transition}
            className="space-y-6"
          >
            <TamirPricePanel
              brand={selectedBrand}
              model={selectedModel}
              modelIconSources={getTamirModelIconSources(
                selectedModel.slug,
                selectedModel.image_url
              )}
              prices={prices}
            />
            <WizardNav
              onBack={goToModels}
              backLabel="Modellere dön"
              onReset={goToBrands}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}


function TamirBreadcrumb({
  brand,
  model,
  view,
  onBrandClick,
  onModelClick,
}: {
  brand: TamirMarkasi | null;
  model: TamirModelOption | null;
  view: View;
  onBrandClick?: () => void;
  onModelClick?: () => void;
}) {
  if (view === "brands") return null;

  return (
    <nav
      aria-label="Tamir fiyatı gezinme"
      className="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm"
    >
      <BreadcrumbButton active={view === "models"} onClick={onBrandClick}>
        {brand?.name ?? "Marka"}
      </BreadcrumbButton>
      {model && (
        <>
          <span className="text-slate-300">/</span>
          <BreadcrumbButton active={view === "prices"} onClick={onModelClick}>
            {model.name}
          </BreadcrumbButton>
        </>
      )}
      {view === "prices" && (
        <>
          <span className="text-slate-300">/</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Fiyatlar
          </span>
        </>
      )}
    </nav>
  );
}

function BreadcrumbButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  if (!onClick) {
    return (
      <span
        className={cn(
          "rounded-full px-3 py-1 font-medium",
          active ? "bg-slate-100 text-slate-700" : "text-slate-500"
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 font-medium transition duration-200",
        active
          ? "bg-slate-100 text-slate-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-emerald-700"
      )}
    >
      {children}
    </button>
  );
}

function WizardNav({
  onBack,
  backLabel,
  onReset,
}: {
  onBack: () => void;
  backLabel: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-emerald-300 hover:text-emerald-700"
      >
        {backLabel}
      </button>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-transparent bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-200/80 hover:text-slate-800"
        >
          Baştan başla
        </button>
      )}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}
