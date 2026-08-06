"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  signInWithRedirect,
  signUpWithRole,
  type SignInState,
  type SignUpState,
} from "@/app/giris/actions";
import { RoleSelector } from "@/components/auth/role-selector";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  ESNAF_ROLE,
  ROLE_LABELS,
  WHOLESALER_ROLE,
  type UserRole,
} from "@/lib/auth/roles";

type Mode = "login" | "register";

const initialSignUpState: SignUpState = {};
const initialSignInState: SignInState = {};

type LoginFormProps = {
  requestedPath?: string;
  defaultRole?: UserRole;
  initialMode?: Mode;
};

export function LoginForm({
  requestedPath,
  defaultRole = ESNAF_ROLE,
  initialMode = "login",
}: LoginFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [signInState, signInAction, isSigningIn] = useActionState(
    signInWithRedirect,
    initialSignInState
  );
  const [signUpState, signUpAction, isSigningUp] = useActionState(
    signUpWithRole,
    initialSignUpState
  );

  useEffect(() => {
    setSelectedRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    if (signUpState.success) {
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    }
  }, [signUpState.success]);

  const isRegister = mode === "register";
  const pageTitle = isRegister ? (
    <>
      EsnafPRO&apos;ya <span className="text-emerald-600">kaydolun</span>
    </>
  ) : (
    <>
      Hesabınıza <span className="text-emerald-600">giriş yapın</span>
    </>
  );

  const pageDescription = isRegister
    ? "Esnaf veya toptancı hesabı oluşturun; rolünüze göre doğru panele yönlendirilirsiniz."
    : "EsnafPRO web paneline erişmek için e-posta ve şifrenizle giriş yapın.";

  return (
    <SubPageShell
      title={pageTitle}
      description={pageDescription}
      contentWidth="md"
      centerHeader
    >
      <Card className="w-full">
        <div className="mb-6 flex rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setConfirmPassword("");
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {isRegister ? (
          <form action={signUpAction} className="space-y-5">
            <RoleSelector
              value={selectedRole}
              onChange={setSelectedRole}
              disabled={isSigningUp}
            />

            <Field label="E-posta">
              <Input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="ornek@esnafpro.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field label="Şifre" hint="En az 6 karakter kullanın.">
              <Input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>

            <Field label="Şifre (Tekrar)">
              <Input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </Field>

            {signUpState.error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {signUpState.error}
              </p>
            )}

            {signUpState.message && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {signUpState.message}
              </p>
            )}

            <Button type="submit" disabled={isSigningUp} className="w-full">
              {isSigningUp
                ? "Hesap oluşturuluyor…"
                : `${ROLE_LABELS[selectedRole]} Hesabı Oluştur`}
            </Button>
          </form>
        ) : (
          <form action={signInAction} className="space-y-5">
            {requestedPath && (
              <input type="hidden" name="next" value={requestedPath} />
            )}

            <Field label="E-posta">
              <Input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="ornek@esnafpro.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field label="Şifre">
              <Input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <Link
                  href="/sifre-sifirla"
                  className="text-xs font-medium text-emerald-600 transition hover:text-emerald-700"
                >
                  Şifrenizi mi unuttunuz?
                </Link>
              </div>
            </Field>

            {signInState.error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {signInState.error}
              </p>
            )}

            {signUpState.message && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {signUpState.message}
              </p>
            )}

            <Button type="submit" disabled={isSigningIn} className="w-full">
              {isSigningIn ? "Giriş yapılıyor…" : "Giriş Yap"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? (
            <>
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                Giriş yapın
              </button>
            </>
          ) : (
            <>
              Hesabınız yok mu?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setSelectedRole(defaultRole);
                }}
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                {defaultRole === WHOLESALER_ROLE ? "Toptancı" : "Esnaf"} olarak kaydolun
              </button>
            </>
          )}
          {" · "}
          <Link href="/" className="font-medium text-emerald-600 hover:text-emerald-700">
            Ana sayfa
          </Link>
        </p>
      </Card>
    </SubPageShell>
  );
}
