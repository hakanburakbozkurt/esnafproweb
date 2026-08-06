import type { User } from "@supabase/supabase-js";

export const ESNAF_ROLE = "esnaf" as const;
export const WHOLESALER_ROLE = "toptanci" as const;

export type UserRole = typeof ESNAF_ROLE | typeof WHOLESALER_ROLE;

export type AuthRoleMetadata = {
  role: UserRole;
  toptanci: boolean;
};

function getWholesalerEmailDomains(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_WHOLESALER_EMAIL_DOMAINS ??
    process.env.WHOLESALER_EMAIL_DOMAINS ??
    "";
  return raw
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function emailMatchesWholesalerDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  return getWholesalerEmailDomains().some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  );
}

export function parseSignupRole(value: string | null | undefined): UserRole {
  return value === WHOLESALER_ROLE ? WHOLESALER_ROLE : ESNAF_ROLE;
}

export function parseSignupRoleFromSearchParam(
  value?: string | null
): UserRole | undefined {
  if (value === ESNAF_ROLE || value === WHOLESALER_ROLE) {
    return value;
  }
  return undefined;
}

export function buildAuthMetadataForRole(role: UserRole): AuthRoleMetadata {
  if (role === WHOLESALER_ROLE) {
    return { role: WHOLESALER_ROLE, toptanci: true };
  }
  return { role: ESNAF_ROLE, toptanci: false };
}

export function getSignupHref(role: UserRole, next?: string): string {
  const params = new URLSearchParams({ role, kayit: "1" });
  if (next) {
    params.set("next", next);
  }
  return `/giris?${params.toString()}`;
}

function readMetadataRecord(user: User): Record<string, unknown> {
  return {
    ...(user.app_metadata ?? {}),
    ...(user.user_metadata ?? {}),
  };
}

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeRoleValue(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === WHOLESALER_ROLE || normalized === "wholesaler") {
    return WHOLESALER_ROLE;
  }
  if (normalized === ESNAF_ROLE || normalized === "merchant" || normalized === "shop") {
    return ESNAF_ROLE;
  }
  return null;
}

/** JWT metadata'sından rol okur; kesin değilse null döner. */
export function getUserRoleFromMetadata(
  user: User | null | undefined
): UserRole | null {
  if (!user) return null;

  const metadata = readMetadataRecord(user);
  const explicitRole = normalizeRoleValue(metadata.role);
  if (explicitRole) {
    return explicitRole;
  }

  if (isTruthyFlag(metadata.toptanci)) {
    return WHOLESALER_ROLE;
  }

  const email = user.email?.toLowerCase();
  if (email && emailMatchesWholesalerDomain(email)) {
    return WHOLESALER_ROLE;
  }

  return null;
}

export function getUserRole(user: User | null | undefined): UserRole {
  return getUserRoleFromMetadata(user) ?? ESNAF_ROLE;
}

export function isWholesalerRole(role: UserRole): boolean {
  return role === WHOLESALER_ROLE;
}

export function isEsnafRole(role: UserRole): boolean {
  return role === ESNAF_ROLE;
}

export function isWholesalerUser(user: User | null | undefined): boolean {
  return isWholesalerRole(getUserRole(user));
}

export function isEsnafUser(user: User | null | undefined): boolean {
  return isEsnafRole(getUserRole(user));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  esnaf: "Esnaf",
  toptanci: "Toptancı",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  esnaf: "Dijital vitrin, ürün vitrini ve yerel SEO araçları ile mağazanızı yönetin.",
  toptanci:
    "XML stok besleme paneli ile esnaf ağına ürün ve fiyat aktarın; mağaza vitrini oluşturamazsınız.",
};
