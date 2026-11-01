import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { buildPlatformJsonLd } from "@/lib/seo/platform-json-ld";

/** Ana sayfa yapılandırılmış verisi (sunucuda render edilir) */
export function PlatformJsonLd() {
  return <JsonLdScripts schemas={buildPlatformJsonLd()} />;
}
