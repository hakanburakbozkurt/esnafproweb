import type { ReactNode } from "react";
import { YonetimDarkShell } from "@/components/yonetim/yonetim-dark-shell";

export function DukkanOnayAdminShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title?: ReactNode;
  description?: string;
}) {
  return (
    <YonetimDarkShell backHref="/yonetim/admin/fiyatlar" backLabel="Admin">
      {title && (
        <div className="mb-10 max-w-3xl lg:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 lg:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-zinc-400 lg:text-lg">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </YonetimDarkShell>
  );
}
