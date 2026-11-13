import { JsonLdScripts } from "@/components/seo/json-ld-scripts";
import { buildFaqPageJsonLd } from "@/lib/dukkan/json-ld";
import { buildPlatformJsonLd } from "@/lib/seo/platform-json-ld";
import type { FaqItem } from "@/types/database.types";

/**
 * Ana sayfa yapılandırılmış verisi (sunucuda render edilir).
 * Sayfada görünen SSS'ler FAQPage olarak da yazılır: Google ve yapay zeka
 * aramaları soruları doğrudan cevap olarak gösterebilir.
 */
export function PlatformJsonLd({ faqItems = [] }: { faqItems?: FaqItem[] }) {
  return <JsonLdScripts schemas={[...buildPlatformJsonLd(), buildFaqPageJsonLd(faqItems)]} />;
}
