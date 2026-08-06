"use client";

import {
  ESNAF_ROLE,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  WHOLESALER_ROLE,
  type UserRole,
} from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";

type RoleSelectorProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
};

const OPTIONS: UserRole[] = [ESNAF_ROLE, WHOLESALER_ROLE];

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-slate-900">Hesap türü</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((role) => {
          const selected = value === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange(role)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition",
                selected
                  ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500"
                  : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
              )}
            >
              <span className="block text-sm font-semibold text-slate-900">
                {ROLE_LABELS[role]}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                {ROLE_DESCRIPTIONS[role]}
              </span>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="role" value={value} />
    </fieldset>
  );
}
