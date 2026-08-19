import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveShopSlugRedirectTarget } from "@/lib/dukkan/slug-history";
import { isReservedSlug } from "@/lib/utils/reserved-slugs";
import type { Database } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

function extractCandidateOldSlug(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const firstSegment = segments[0].toLowerCase();
  if (isReservedSlug(firstSegment)) {
    return null;
  }

  return firstSegment;
}

export async function tryShopSlugRedirect(
  request: NextRequest,
  supabase: SupabaseDbClient
): Promise<NextResponse | null> {
  const oldSlug = extractCandidateOldSlug(request.nextUrl.pathname);
  if (!oldSlug) {
    return null;
  }

  const newSlug = await resolveShopSlugRedirectTarget(supabase, oldSlug);
  if (!newSlug || newSlug === oldSlug) {
    return null;
  }

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  segments[0] = newSlug;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${segments.join("/")}`;

  return NextResponse.redirect(redirectUrl, 301);
}
