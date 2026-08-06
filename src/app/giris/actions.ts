"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPostLoginPath } from "@/lib/auth/wholesaler";
import {
  buildAuthMetadataForRole,
  ESNAF_ROLE,
  parseSignupRole,
  WHOLESALER_ROLE,
  type UserRole,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type SignUpState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type SignInState = {
  error?: string;
};

function getSafeRedirect(next?: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return undefined;
  }
  return next;
}

function signUpSuccessMessage(role: UserRole): string {
  if (role === WHOLESALER_ROLE) {
    return "Toptancı hesabınız oluşturuldu. E-posta doğrulaması açıksa gelen kutunuzu kontrol edin, ardından firma profilinizi tamamlayabilirsiniz.";
  }
  return "Esnaf hesabınız oluşturuldu. E-posta doğrulaması açıksa gelen kutunuzu kontrol edin, ardından mağazanızı açabilirsiniz.";
}

export async function signInWithRedirect(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedPath = getSafeRedirect(String(formData.get("next") ?? ""));

  if (!email) {
    return { error: "E-posta adresi zorunludur." };
  }

  if (!password) {
    return { error: "Şifre zorunludur." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Giriş başarısız. Lütfen tekrar deneyin." };
  }

  revalidatePath("/", "layout");

  redirect(await getPostLoginPath(supabase, data.user, requestedPath));
}

export async function signUpWithRole(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const role = parseSignupRole(String(formData.get("role") ?? ESNAF_ROLE));

  if (!email) {
    return { error: "E-posta adresi zorunludur." };
  }

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }

  if (password !== confirmPassword) {
    return { error: "Şifreler birbiriyle uyuşmuyor." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: buildAuthMetadataForRole(role),
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/giris");

  return {
    success: true,
    message: signUpSuccessMessage(role),
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/giris");
}
