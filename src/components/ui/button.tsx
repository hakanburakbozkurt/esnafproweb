import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonPrimaryClassName, cn } from "@/lib/utils/cn";

export function Button({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button className={cn(buttonPrimaryClassName, className)} {...props}>
      {children}
    </button>
  );
}
