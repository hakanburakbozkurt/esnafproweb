"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPasswordResetRedirectUrl } from "@/lib/auth/site-url";
import { getPostLoginPath } from "@/lib/auth/wholesaler";
import { createClient } from "@/lib/supabase/server";

export type PasswordResetRequestState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type UpdatePasswordState = {
  error?: string;
};

export async function requestPasswordReset(
  _prev: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "E-posta adresi zorunludur." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUrl(),
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
  };
}

export async function updatePasswordAndRedirect(
  _prev: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }

  if (password !== confirmPassword) {
    return { error: "Şifreler eşleşmiyor." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Geçerli bir oturum bulunamadı. Lütfen e-postanızdaki şifre sıfırlama bağlantısını tekrar kullanın.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(await getPostLoginPath(supabase, user, "/yonetim"));
}
