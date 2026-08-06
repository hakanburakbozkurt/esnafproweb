import type { ReactNode } from "react";
import { cardClassName, cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(cardClassName, className)}>{children}</div>;
}
