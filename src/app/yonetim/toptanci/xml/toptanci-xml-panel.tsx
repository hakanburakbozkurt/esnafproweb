import Link from "next/link";
import { ToptanciXmlMappingPanel } from "@/components/toptanci/toptanci-xml-mapping-panel";
import { XmlFileUploadZone } from "@/components/toptanci/xml-file-upload-zone";
import { Card } from "@/components/ui/card";
import { feedMappingToFormDefaults } from "@/lib/toptanci/feed-mapping";
import { loadUserFeedMapping } from "@/lib/toptanci/import-vitrin-feed";
import { createClient } from "@/lib/supabase/server";

const sectionTitleClass =
  "border-b border-slate-200 pb-3 text-lg font-semibold text-slate-900";

type ToptanciXmlPanelProps = {
  mappingDefaults: Record<string, string>;
  savedFeedUrl: string | null;
};

export async function ToptanciXmlPanelLoader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let mappingDefaults: Record<string, string> = feedMappingToFormDefaults(null);
  let savedFeedUrl: string | null = null;

  if (user) {
    const savedMapping = await loadUserFeedMapping(supabase, user.id);
    mappingDefaults = feedMappingToFormDefaults(savedMapping);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("xml_url")
      .eq("id", user.id)
      .maybeSingle();
    savedFeedUrl = profile?.xml_url ?? null;

    if (!savedFeedUrl) {
      const { data: latestFeed } = await supabase
        .from("wholesaler_xmls")
        .select("xml_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      savedFeedUrl = latestFeed?.xml_url ?? null;
    }
  }

  return (
    <ToptanciXmlPanel mappingDefaults={mappingDefaults} savedFeedUrl={savedFeedUrl} />
  );
}

export function ToptanciXmlPanel({ mappingDefaults, savedFeedUrl }: ToptanciXmlPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100/80 bg-white/80 px-6 py-5 shadow-sm lg:px-8">
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Toptancı Paneli
        </span>
        <p className="mt-4 text-sm leading-relaxed text-slate-500 lg:text-base">
          Ürün stok ve fiyat güncellemelerini tek merkezden yönetin. XML/JSON feed
          yükleyin veya URL ile senkronize edin. Alan eşlemesi XML feedler için
          kaydedilir; JSON (Azunlar) otomatik işlenir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="w-full space-y-4">
            <h2 className={sectionTitleClass}>Manuel Dosya Yükle</h2>
            <p className="text-sm text-slate-500">
              XML veya JSON dosyası yükleyin. Kayıtlı eşleme ayarları XML importunda
              otomatik uygulanır.
            </p>
            <XmlFileUploadZone />
          </Card>
        </div>

        <Card className="w-full space-y-4">
          <h2 className={sectionTitleClass}>Veri Eşleme (Mapping) Ayarları</h2>
          <ToptanciXmlMappingPanel
            mappingDefaults={mappingDefaults}
            savedFeedUrl={savedFeedUrl}
          />
        </Card>
      </div>

      <p className="text-center text-sm text-slate-500">
        Firma bilgilerinizi güncellemek için{" "}
        <Link
          href="/toptanci-ayarlari"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          profil ayarlarına gidin
        </Link>
      </p>
    </div>
  );
}
