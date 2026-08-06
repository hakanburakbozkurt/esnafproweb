"use client";

import { useFormStatus } from "react-dom";
import { signOut } from "@/app/giris/actions";
import { cn } from "@/lib/utils/cn";

function SignOutSubmit({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-full border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60",
        pending && "cursor-wait",
        className
      )}
    >
      {pending ? "Çıkış…" : "Çıkış Yap"}
    </button>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOut}>
      <SignOutSubmit className={className} />
    </form>
  );
}
