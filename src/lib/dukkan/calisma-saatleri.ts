export const CALISMA_SAATLERI_VERSION = 1 as const;

export const DAY_ORDER = [
  "pazartesi",
  "sali",
  "carsamba",
  "persembe",
  "cuma",
  "cumartesi",
  "pazar",
] as const;

export type DayKey = (typeof DAY_ORDER)[number];

export type DaySchedule = {
  acik: boolean;
  baslangic: string;
  bitis: string;
};

export type WeeklySchedule = {
  v: typeof CALISMA_SAATLERI_VERSION;
  gunler: Record<DayKey, DaySchedule>;
};

export const DAY_LABELS: Record<DayKey, string> = {
  pazartesi: "Pazartesi",
  sali: "Salı",
  carsamba: "Çarşamba",
  persembe: "Perşembe",
  cuma: "Cuma",
  cumartesi: "Cumartesi",
  pazar: "Pazar",
};

const SCHEMA_DAY: Record<DayKey, string> = {
  pazartesi: "Mo",
  sali: "Tu",
  carsamba: "We",
  persembe: "Th",
  cuma: "Fr",
  cumartesi: "Sa",
  pazar: "Su",
};

const JS_DAY_TO_KEY: Record<number, DayKey> = {
  0: "pazar",
  1: "pazartesi",
  2: "sali",
  3: "carsamba",
  4: "persembe",
  5: "cuma",
  6: "cumartesi",
};

export function createDefaultDaySchedule(
  overrides?: Partial<DaySchedule>
): DaySchedule {
  return {
    acik: true,
    baslangic: "09:00",
    bitis: "19:00",
    ...overrides,
  };
}

export function createDefaultWeeklySchedule(): WeeklySchedule {
  return {
    v: CALISMA_SAATLERI_VERSION,
    gunler: {
      pazartesi: createDefaultDaySchedule(),
      sali: createDefaultDaySchedule(),
      carsamba: createDefaultDaySchedule(),
      persembe: createDefaultDaySchedule(),
      cuma: createDefaultDaySchedule(),
      cumartesi: createDefaultDaySchedule({ baslangic: "10:00", bitis: "18:00" }),
      pazar: createDefaultDaySchedule({ acik: false, baslangic: "09:00", bitis: "19:00" }),
    },
  };
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function normalizeTimeValue(value: unknown, fallback = "09:00"): string {
  const str = String(value ?? "").trim();
  const match = str.match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) return fallback;

  const hour = Number(match[1]);
  if (hour < 0 || hour > 23) return fallback;

  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

function parseAcik(value: unknown, defaultValue = false): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      ["true", "1", "evet", "acik", "açık", "open", "yes"].includes(normalized)
    ) {
      return true;
    }
    if (
      ["false", "0", "hayir", "hayır", "kapali", "kapalı", "closed", "no"].includes(
        normalized
      )
    ) {
      return false;
    }
  }

  return defaultValue;
}

function parseCalismaSaatleriPayload(raw: unknown): WeeklySchedule | null {
  if (raw == null) return null;

  let parsed: unknown = raw;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      return null;
    }

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return null;
    }

    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return null;
      }
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  const record = parsed as {
    v?: unknown;
    gunler?: Partial<Record<DayKey, unknown>>;
  };

  if (!record.gunler || typeof record.gunler !== "object") return null;

  const version = Number(record.v);
  if (
    record.v != null &&
    !Number.isNaN(version) &&
    version !== CALISMA_SAATLERI_VERSION
  ) {
    return null;
  }

  const gunler = {} as Record<DayKey, DaySchedule>;

  for (const day of DAY_ORDER) {
    const fallback = createDefaultDaySchedule({
      acik: false,
      baslangic: "09:00",
      bitis: "19:00",
    });
    const schedule = normalizeDaySchedule(record.gunler[day], fallback);
    if (!schedule) return null;
    gunler[day] = schedule;
  }

  return { v: CALISMA_SAATLERI_VERSION, gunler };
}

function normalizeDaySchedule(
  value: unknown,
  fallback?: DaySchedule
): DaySchedule | null {
  if (!value || typeof value !== "object") {
    return fallback ?? null;
  }

  const record = value as Record<string, unknown>;
  const acik = parseAcik(
    record.acik ?? record.open ?? record.aktif ?? record.isOpen,
    fallback?.acik ?? false
  );
  const baslangic = normalizeTimeValue(
    record.baslangic ?? record.start ?? record.openTime ?? record.acilis,
    fallback?.baslangic ?? "09:00"
  );
  const bitis = normalizeTimeValue(
    record.bitis ?? record.end ?? record.closeTime ?? record.kapanis,
    fallback?.bitis ?? "19:00"
  );

  if (!isValidTime(baslangic) || !isValidTime(bitis)) {
    return fallback ?? null;
  }

  return { acik, baslangic, bitis };
}

export function parseCalismaSaatleri(
  raw: string | Record<string, unknown> | null | undefined
): WeeklySchedule | null {
  return parseCalismaSaatleriPayload(raw);
}

export function coerceCalismaSaatleriState(
  raw: string | Record<string, unknown> | null | undefined
): WeeklySchedule {
  return parseCalismaSaatleri(raw) ?? createDefaultWeeklySchedule();
}

export function serializeCalismaSaatleri(schedule: WeeklySchedule): string {
  const normalized: WeeklySchedule = {
    v: CALISMA_SAATLERI_VERSION,
    gunler: DAY_ORDER.reduce(
      (acc, day) => {
        const entry = schedule.gunler[day];
        acc[day] = {
          acik: entry.acik === true,
          baslangic: normalizeTimeValue(entry.baslangic, "09:00"),
          bitis: normalizeTimeValue(entry.bitis, "19:00"),
        };
        return acc;
      },
      {} as Record<DayKey, DaySchedule>
    ),
  };

  return JSON.stringify(normalized);
}

export function validateWeeklySchedule(schedule: WeeklySchedule): string | null {
  for (const day of DAY_ORDER) {
    const entry = schedule.gunler[day];
    if (!entry) return "Çalışma saatleri eksik gün içeriyor.";

    if (!isValidTime(entry.baslangic) || !isValidTime(entry.bitis)) {
      return `${DAY_LABELS[day]} için geçerli saat aralığı seçin.`;
    }

    if (entry.acik === true && entry.baslangic >= entry.bitis) {
      return `${DAY_LABELS[day]} için bitiş saati başlangıçtan sonra olmalıdır.`;
    }
  }

  return null;
}

export function getTodayDayKey(date = new Date()): DayKey {
  return JS_DAY_TO_KEY[date.getDay()];
}

export function isDayOpenNow(day: DaySchedule, date = new Date()): boolean {
  if (day.acik !== true) return false;

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const [startHour, startMinute] = day.baslangic.split(":").map(Number);
  const [endHour, endMinute] = day.bitis.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function isStoreOpenNow(
  schedule: WeeklySchedule,
  date = new Date()
): boolean {
  const today = getTodayDayKey(date);
  return isDayOpenNow(schedule.gunler[today], date);
}

export function formatDayHours(day: DaySchedule): string {
  if (day.acik !== true) return "Kapalı";
  return `${day.baslangic} – ${day.bitis}`;
}

export function formatDayStatus(day: DaySchedule): "Açık" | "Kapalı" {
  return day.acik === true ? "Açık" : "Kapalı";
}

export function hasAnyOpenDay(schedule: WeeklySchedule): boolean {
  return DAY_ORDER.some((day) => schedule.gunler[day].acik === true);
}

export function applyDayToAll(
  schedule: WeeklySchedule,
  sourceDay: DayKey = "pazartesi"
): WeeklySchedule {
  const source = schedule.gunler[sourceDay];

  return {
    ...schedule,
    gunler: DAY_ORDER.reduce(
      (acc, day) => {
        acc[day] = { ...source };
        return acc;
      },
      {} as Record<DayKey, DaySchedule>
    ),
  };
}

export function applyWeekdayTemplate(schedule: WeeklySchedule): WeeklySchedule {
  return {
    ...schedule,
    gunler: {
      pazartesi: createDefaultDaySchedule(),
      sali: createDefaultDaySchedule(),
      carsamba: createDefaultDaySchedule(),
      persembe: createDefaultDaySchedule(),
      cuma: createDefaultDaySchedule(),
      cumartesi: createDefaultDaySchedule({ baslangic: "10:00", bitis: "18:00" }),
      pazar: createDefaultDaySchedule({ acik: false }),
    },
  };
}

export function toSchemaOrgOpeningHours(schedule: WeeklySchedule): string[] {
  return DAY_ORDER.filter((day) => schedule.gunler[day].acik === true).map((day) => {
    const entry = schedule.gunler[day];
    return `${SCHEMA_DAY[day]} ${entry.baslangic}-${entry.bitis}`;
  });
}

export function isLegacyCalismaSaatleri(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  return parseCalismaSaatleri(raw) === null;
}

export function getLegacyCalismaSaatleriLines(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
