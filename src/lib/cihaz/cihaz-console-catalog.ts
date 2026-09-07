/** Cihaz Al — Konsol marka / model / kasa / sürücü hapis listeleri */

export const CONSOLE_BRANDS = [
  "PlayStation",
  "Xbox",
  "Nintendo",
  "Asus ROG Ally",
  "Steam Deck",
  "Lenovo",
] as const;

export type ConsoleBrand = (typeof CONSOLE_BRANDS)[number];

export const CONSOLE_MODELS_BY_BRAND: Record<ConsoleBrand, readonly string[]> =
  {
    PlayStation: [
      "PlayStation 1",
      "PlayStation 2",
      "PlayStation 3",
      "PlayStation 4",
      "PlayStation 4 Pro",
      "PlayStation 5",
      "PlayStation 5 Pro",
      "PlayStation Portable (PSP)",
      "PlayStation Vita",
      "PlayStation Portal",
    ],
    Xbox: [
      "Xbox One",
      "Xbox One S",
      "Xbox One X",
      "Xbox Series S",
      "Xbox Series X",
    ],
    Nintendo: [
      "Nintendo Switch (V1 / V2 - Normal Kasa)",
      "Nintendo Switch Lite",
      "Nintendo Switch OLED",
      "Nintendo 3DS / 3DS XL",
      "Nintendo 2DS / 2DS XL",
    ],
    "Asus ROG Ally": ["ROG Ally", "ROG Ally X"],
    "Steam Deck": ["Steam Deck LCD", "Steam Deck OLED"],
    Lenovo: ["Legion Go"],
  };

export const CONSOLE_CASING_BY_MODEL: Record<string, readonly string[]> = {
  "PlayStation 1": ["Klasik (Fat)", "PS one"],
  "PlayStation 2": ["Fat", "Slim"],
  "PlayStation 3": ["Fat", "Slim", "Super Slim"],
  "PlayStation 4": ["Fat", "Slim"],
  "PlayStation 5": ["Klasik (İlk Kasa)", "Slim"],
  "Nintendo Switch (V1 / V2 - Normal Kasa)": ["V1", "V2"],
};

export const CONSOLE_STORAGE_OPTIONS = [
  "32 GB",
  "64 GB",
  "128 GB",
  "256 GB",
  "500 GB",
  "512 GB",
  "825 GB",
  "1 TB",
  "2 TB",
] as const;

const ALWAYS_DIGITAL_BRANDS: readonly string[] = [
  "Steam Deck",
  "Asus ROG Ally",
  "Lenovo",
];

const LOCKED_DRIVE_BY_MODEL: Record<string, string> = {
  "PlayStation Portal": "Dijital",
  "Xbox Series S": "Dijital",
  "Nintendo Switch Lite": "Dijital",
  "Nintendo 3DS / 3DS XL": "Kartlı",
  "Nintendo 2DS / 2DS XL": "Kartlı",
};

export function getConsoleModelsForBrand(brand: string): readonly string[] {
  if (!brand) return [];
  return CONSOLE_MODELS_BY_BRAND[brand as ConsoleBrand] ?? [];
}

export function showCasingTypeForModel(model: string): boolean {
  return model in CONSOLE_CASING_BY_MODEL;
}

export function getCasingOptionsForModel(model: string): readonly string[] {
  return CONSOLE_CASING_BY_MODEL[model] ?? [];
}

export function showDriveTypeForBrand(brand: string): boolean {
  return brand === "PlayStation" || brand === "Xbox" || brand === "Nintendo";
}

export function getDriveOptionsForBrand(brand: string): readonly string[] {
  if (brand === "PlayStation" || brand === "Xbox") return ["CD", "Dijital"];
  if (brand === "Nintendo") return ["Kartlı", "Dijital"];
  return [];
}

export function hideDriveTypeForBrand(brand: string): boolean {
  return ALWAYS_DIGITAL_BRANDS.includes(brand);
}

export function getLockedDriveType(
  brand: string,
  model: string
): string | null {
  if (hideDriveTypeForBrand(brand)) return "Dijital";
  if (!model) return null;
  return LOCKED_DRIVE_BY_MODEL[model] ?? null;
}

export function hideDriveTypeField(brand: string, model: string): boolean {
  if (hideDriveTypeForBrand(brand)) return true;
  if (!model) return false;
  return getLockedDriveType(brand, model) !== null;
}

export function resolveConsoleDriveOnModelChange(
  brand: string,
  model: string,
  currentDrive: string
): string {
  const locked = getLockedDriveType(brand, model);
  if (locked) return locked;
  const opts = getDriveOptionsForBrand(brand);
  if (opts.length === 0) return "";
  return opts.includes(currentDrive) ? currentDrive : "";
}
