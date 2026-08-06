import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ESNAF_ROLE,
  getUserRoleFromMetadata,
  WHOLESALER_ROLE,
  type UserRole,
} from "@/lib/auth/roles";
import type { Database } from "@/types/database.types";

type SupabaseDbClient = SupabaseClient<Database>;

function normalizeStoredRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === WHOLESALER_ROLE) return WHOLESALER_ROLE;
  if (normalized === ESNAF_ROLE) return ESNAF_ROLE;
  return null;
}

export async function fetchUserRoleFromDatabase(
  supabase: SupabaseDbClient,
  userId: string
): Promise<UserRole | null> {
  const { data: rpcRole, error: rpcError } = await supabase.rpc("get_my_role");

  if (!rpcError && typeof rpcRole === "string") {
    const normalized = normalizeStoredRole(rpcRole);
    if (normalized) return normalized;
  } else if (rpcError && rpcError.code !== "PGRST202") {
    console.error("[fetchUserRoleFromDatabase:rpc]", rpcError.message);
  }

  const { data, error } = await supabase
    .from("kullanici_profilleri")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[fetchUserRoleFromDatabase:table]", error.message);
    return null;
  }

  return normalizeStoredRole(data?.role);
}

async function fetchWholesalerRoleFromToptanciProfile(
  supabase: SupabaseDbClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("toptancilar")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[fetchWholesalerRoleFromToptanciProfile]", error.message);
    return false;
  }

  return Boolean(data?.id);
}

/**
 * Öncelik: kullanici_profilleri → JWT metadata → toptancilar kaydı.
 * Sunucu tarafı yönlendirme ve guard'lar bu fonksiyonu kullanmalı.
 */
export async function resolveUserRole(
  supabase: SupabaseDbClient,
  user: User
): Promise<UserRole> {
  const databaseRole = await fetchUserRoleFromDatabase(supabase, user.id);
  if (databaseRole === WHOLESALER_ROLE) {
    return WHOLESALER_ROLE;
  }
  if (databaseRole === ESNAF_ROLE) {
    return ESNAF_ROLE;
  }

  const metadataRole = getUserRoleFromMetadata(user);
  if (metadataRole === WHOLESALER_ROLE) {
    return WHOLESALER_ROLE;
  }

  if (await fetchWholesalerRoleFromToptanciProfile(supabase, user.id)) {
    return WHOLESALER_ROLE;
  }

  return metadataRole ?? ESNAF_ROLE;
}

export async function isWholesalerAccount(
  supabase: SupabaseDbClient,
  user: User
): Promise<boolean> {
  return (await resolveUserRole(supabase, user)) === WHOLESALER_ROLE;
}

export async function isEsnafAccount(
  supabase: SupabaseDbClient,
  user: User
): Promise<boolean> {
  return (await resolveUserRole(supabase, user)) === ESNAF_ROLE;
}
