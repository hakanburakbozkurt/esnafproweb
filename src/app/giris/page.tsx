import { redirect } from "next/navigation";
import { LoginForm } from "@/app/giris/login-form";
import {
  ESNAF_ROLE,
  parseSignupRoleFromSearchParam,
  type UserRole,
} from "@/lib/auth/roles";
import { getPostLoginPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ next?: string; role?: string; kayit?: string }>;
};

function getSafeRedirect(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return undefined;
  }
  return next;
}

function resolveDefaultRole(roleParam?: string): UserRole {
  return parseSignupRoleFromSearchParam(roleParam) ?? ESNAF_ROLE;
}

export default async function GirisPage({ searchParams }: PageProps) {
  const { next, role, kayit } = await searchParams;
  const requestedPath = getSafeRedirect(next);
  const defaultRole = resolveDefaultRole(role);
  const initialMode = kayit === "1" || role ? "register" : "login";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await getPostLoginPath(supabase, user, requestedPath));
  }

  return (
    <LoginForm
      requestedPath={requestedPath}
      defaultRole={defaultRole}
      initialMode={initialMode}
    />
  );
}
