import type { XmlMapping, VitrinXmlMappingFieldKey } from "@/lib/toptanci/vitrin-import/vitrinXmlMappingFields";
import { VITRIN_XML_PANEL_FIELDS } from "@/lib/toptanci/vitrin-import/vitrinXmlMappingFields";

export type FeedMappingRecord = XmlMapping;

export function parseFeedMappingForm(formData: FormData): FeedMappingRecord {
  const mapping: FeedMappingRecord = {};
  for (const field of VITRIN_XML_PANEL_FIELDS) {
    const value = String(formData.get(`mapping_${field.key}`) ?? "").trim();
    if (value) {
      mapping[field.key] = value;
    }
  }
  return mapping;
}

export function feedMappingToFormDefaults(mapping: FeedMappingRecord | null | undefined) {
  const defaults: Record<string, string> = {};
  for (const field of VITRIN_XML_PANEL_FIELDS) {
    defaults[field.key] = mapping?.[field.key] ?? field.placeholder ?? "";
  }
  return defaults;
}

export function isValidFeedMapping(mapping: FeedMappingRecord): string | null {
  if (!mapping.name?.trim()) {
    return "Ürün adı eşlemesi zorunludur.";
  }
  if (!mapping.price?.trim()) {
    return "Fiyat eşlemesi zorunludur.";
  }
  return null;
}

export function sanitizeStoredFeedMapping(raw: unknown): FeedMappingRecord | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: FeedMappingRecord = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) {
      out[key as VitrinXmlMappingFieldKey] = value.trim();
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}
