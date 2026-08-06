import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isWholesalerAccount } from "@/lib/auth/resolve-user-role";
import { hasToptanciProfile } from "@/lib/toptanci/get-toptanci";
import type { Database } from "@/types/database.types";

export {
  ESNAF_ROLE,
  getUserRole,
  getUserRoleFromMetadata,
  isEsnafUser,
  isWholesalerUser,
  WHOLESALER_ROLE,
} from "@/lib/auth/roles";

export {
  isEsnafAccount,
  isWholesalerAccount,
  resolveUserRole,
} from "@/lib/auth/resolve-user-role";

export const WHOLESALER_ONBOARDING_PATH = "/toptanci-ac";
export const WHOLESALER_XML_PATH = "/yonetim/toptanci/xml";
/** @deprecated WHOLESALER_XML_PATH veya resolveWholesalerPath kullanın */
export const WHOLESALER_HOME = WHOLESALER_XML_PATH;

const ESNAF_BLOCKED_PATHS = ["/dukkan-ac", "/dukkan-ayarlari", "/yonetim"] as const;

export function wholesalerStoreAccessError(): string {
  return "Toptancı hesapları esnaf mağaza vitrini oluşturamaz. Toptancı profilinizi tamamlayıp XML panelini kullanın.";
}

export function isWholesalerYonetimPath(pathname: string): boolean {
  return (
    pathname === "/yonetim/toptanci" || pathname.startsWith("/yonetim/toptanci/")
  );
}

export function isToptanciOnboardingPath(pathname: string): boolean {
  return pathname === WHOLESALER_ONBOARDING_PATH || pathname === "/toptanci-ayarlari";
}

export function isToptanciPanelPath(pathname: string): boolean {
  return (
    pathname === "/toptanci" ||
    pathname.startsWith("/toptanci/") ||
    isWholesalerYonetimPath(pathname) ||
    isToptanciOnboardingPath(pathname)
  );
}

export function isEsnafStorePath(pathname: string): boolean {
  if (isWholesalerYonetimPath(pathname) || isToptanciOnboardingPath(pathname)) {
    return false;
  }

  return ESNAF_BLOCKED_PATHS.some(
    (blocked) => pathname === blocked || pathname.startsWith(`${blocked}/`)
  );
}

export function requiresToptanciProfile(pathname: string): boolean {
  if (isToptanciOnboardingPath(pathname)) return false;
  if (pathname === "/giris" || pathname.startsWith("/giris/")) return false;
  return isToptanciPanelPath(pathname);
}

function sanitizeWholesalerRequestedPath(requestedPath?: string): string | undefined {
  if (
    !requestedPath ||
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//") ||
    isEsnafStorePath(requestedPath) ||
    !isToptanciPanelPath(requestedPath)
  ) {
    return undefined;
  }
  return requestedPath;
}

type SupabaseDbClient = SupabaseClient<Database>;

export async function resolveWholesalerPath(
  supabase: SupabaseDbClient,
  userId: string,
  requestedPath?: string
): Promise<string> {
  const hasProfile = await hasToptanciProfile(supabase, userId);
  const safeRequestedPath = sanitizeWholesalerRequestedPath(requestedPath);

  if (safeRequestedPath) {
    if (!hasProfile && requiresToptanciProfile(safeRequestedPath)) {
      return WHOLESALER_ONBOARDING_PATH;
    }
    return safeRequestedPath;
  }

  return hasProfile ? WHOLESALER_XML_PATH : WHOLESALER_ONBOARDING_PATH;
}

export async function getPostLoginPath(
  supabase: SupabaseDbClient,
  user: User,
  requestedPath?: string
): Promise<string> {
  if (await isWholesalerAccount(supabase, user)) {
    return resolveWholesalerPath(
      supabase,
      user.id,
      sanitizeWholesalerRequestedPath(requestedPath)
    );
  }

  if (
    requestedPath &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !isToptanciPanelPath(requestedPath)
  ) {
    return requestedPath;
  }

  return "/dukkan-ac";
}
