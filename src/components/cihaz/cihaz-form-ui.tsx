import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn, inputClassName, labelClassName } from "@/lib/utils/cn";

export const cihazSelectClassName =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export function CihazField({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className={labelClassName}>{label}</span>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function CihazInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function CihazSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={cn(cihazSelectClassName, className)} {...props}>
      {children}
    </select>
  );
}

export function CihazTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputClassName, "min-h-[96px] resize-y", className)}
      {...props}
    />
  );
}

export function CihazCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      {label}
    </label>
  );
}

export function CihazSectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
      {icon}
      {children}
    </div>
  );
}
