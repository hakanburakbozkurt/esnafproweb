import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LocalYonetimSidebar } from "@/components/local-yonetim/local-yonetim-sidebar";
import { isLocalYonetimAccessAllowed } from "@/lib/local-yonetim/access";

export const metadata = {
  title: "Local Yönetim | EsnafPro",
  robots: {
    index: false,
    follow: false,
  },
};

type LocalYonetimLayoutProps = {
  children: ReactNode;
};

export default async function LocalYonetimLayout({
  children,
}: LocalYonetimLayoutProps) {
  const headersList = await headers();
  const host = headersList.get("host")?.split(":")[0] ?? "";

  if (!isLocalYonetimAccessAllowed(host)) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7F5]">
      <LocalYonetimSidebar />

      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-10">
          <div className="mx-auto min-h-[85vh] max-w-6xl rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
