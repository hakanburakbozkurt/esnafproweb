"use client";

import { useActionState, useEffect } from "react";
import {
  deleteWholesalerXmlAction,
  saveWholesalerXml,
  type SaveXmlState,
} from "@/app/toptanci/xml-yukle/actions";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { AnimatedBentoCard } from "@/components/layout/animated-bento-card";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { desktopGridGapClass } from "@/lib/utils/layout";
import type { WholesalerXml } from "@/types/database.types";

const initialState: SaveXmlState = {};

function XmlUploadForm() {
  const [state, formAction, isPending] = useActionState(
    saveWholesalerXml,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById("xml-upload-form") as HTMLFormElement;
      form?.reset();
    }
  }, [state.success]);

  return (
    <AnimatedBentoCard title="Yeni XML Ekle">
      <form id="xml-upload-form" action={formAction} className="space-y-5">
        <Field label="Liste Adı" hint="Örn: Ana Fiyat Listesi">
          <Input name="name" required placeholder="XML listesi adı" />
        </Field>

        <Field label="XML URL" hint="Toptancı fiyat ve stok XML adresi">
          <Input
            name="xml_url"
            type="url"
            required
            placeholder="https://example.com/feed.xml"
          />
        </Field>

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
          />
          Aktif olarak kaydet
        </label>

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            XML listesi başarıyla kaydedildi.
          </p>
        )}

        <Button type="submit" disabled={isPending} className="min-h-11">
          {isPending ? "Kaydediliyor…" : "XML Kaydet"}
        </Button>
      </form>
    </AnimatedBentoCard>
  );
}

function XmlList({ items }: { items: WholesalerXml[] }) {
  if (!items.length) {
    return (
      <AnimatedBentoCard title="Kayıtlı XML Listeleri">
        <p className="text-sm text-slate-500 lg:text-base">
          Henüz kayıtlı XML listesi yok.
        </p>
      </AnimatedBentoCard>
    );
  }

  return (
    <AnimatedBentoCard title="Kayıtlı XML Listeleri" revealDelay={0.08}>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 lg:p-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-slate-900 lg:text-lg">
                  {item.name}
                </p>
                <p className="mt-1 truncate text-sm text-slate-500">{item.xml_url}</p>
                <p className="mt-2 text-xs text-slate-400 lg:text-sm">
                  {item.is_active ? (
                    <span className="text-emerald-600">Aktif</span>
                  ) : (
                    <span>Pasif</span>
                  )}
                  {item.last_synced_at &&
                    ` · Son senkron: ${new Date(item.last_synced_at).toLocaleDateString("tr-TR")}`}
                </p>
              </div>
              <form action={deleteWholesalerXmlAction} className="shrink-0">
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="min-h-10 text-sm font-medium text-slate-400 transition-colors hover:text-red-600"
                >
                  Sil
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </AnimatedBentoCard>
  );
}

export default function ToptanciXmlPage({
  authenticated,
  xmlList,
}: {
  authenticated: boolean;
  xmlList: WholesalerXml[];
}) {
  return (
    <SubPageShell
      title={
        <>
          Toptancı <span className="text-emerald-600">XML Paneli</span>
        </>
      }
      description="Fiyat ve stok XML adreslerinizi geniş ekranda yönetin. Esnaflar güncel listeleri sisteme otomatik çeker."
    >
      {authenticated ? (
        <div className={`grid grid-cols-1 ${desktopGridGapClass} lg:grid-cols-12`}>
          <div className="lg:col-span-5">
            <XmlUploadForm />
          </div>
          <div className="lg:col-span-7">
            <XmlList items={xmlList} />
          </div>
        </div>
      ) : (
        <AuthRequiredCard
          description="XML yönetim paneline erişmek için toptancı hesabınızla giriş yapmalısınız."
          loginHref="/giris?next=/toptanci/xml-yukle"
        />
      )}
    </SubPageShell>
  );
}
