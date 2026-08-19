import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isWholesalerAccount } from "@/lib/auth/resolve-user-role";
import {
  isEsnafStorePath,
  isToptanciOnboardingPath,
  isToptanciPanelPath,
  requiresToptanciProfile,
  resolveWholesalerPath,
  WHOLESALER_ONBOARDING_PATH,
} from "@/lib/auth/wholesaler";
import { hasToptanciProfile } from "@/lib/toptanci/get-toptanci";
import { tryShopSlugRedirect } from "@/lib/dukkan/shop-slug-redirect";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const slugRedirect = await tryShopSlugRedirect(request, supabase);
  if (slugRedirect) {
    return slugRedirect;
  }

  if (user) {
    const wholesaler = await isWholesalerAccount(supabase, user);

    if (wholesaler) {
      const profileExists = await hasToptanciProfile(supabase, user.id);

      if (isEsnafStorePath(pathname)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = await resolveWholesalerPath(supabase, user.id);
        return NextResponse.redirect(redirectUrl);
      }

      if (profileExists && pathname === WHOLESALER_ONBOARDING_PATH) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = await resolveWholesalerPath(supabase, user.id);
        return NextResponse.redirect(redirectUrl);
      }

      if (
        !profileExists &&
        requiresToptanciProfile(pathname) &&
        !isToptanciOnboardingPath(pathname)
      ) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = WHOLESALER_ONBOARDING_PATH;
        return NextResponse.redirect(redirectUrl);
      }
    } else if (isToptanciPanelPath(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dukkan-ac";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|PNG)$).*)",
  ],
};
