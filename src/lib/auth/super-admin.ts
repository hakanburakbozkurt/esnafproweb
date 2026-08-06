import type { User } from "@supabase/supabase-js";

function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** Super admin yalnızca sunucu tarafı SUPER_ADMIN_EMAILS listesiyle belirlenir. */
export function isSuperAdminUser(user: User | null | undefined): boolean {
  if (!user?.email) return false;

  return getSuperAdminEmails().includes(user.email.toLowerCase());
}
