import Link from "next/link";
import { adminBtnSecondaryClass } from "@/components/yonetim/admin-ui";

type AdminNavProps = {
  current?: "home" | "fiyatlar" | "odemeler" | "sss" | "dukkan-onay" | "esnaf-kurulum";
};

const links = [
  { href: "/yonetim/admin", key: "home" as const, label: "Ana Sayfa" },
  { href: "/yonetim/admin/fiyatlar", key: "fiyatlar" as const, label: "Fiyatlar" },
  { href: "/yonetim/admin/odemeler", key: "odemeler" as const, label: "Ödemeler" },
  { href: "/yonetim/admin/sss", key: "sss" as const, label: "SSS" },
  { href: "/yonetim/admin/dukkan-onay", key: "dukkan-onay" as const, label: "Dükkan Onay" },
  { href: "/yonetim/admin/esnaf-kurulum", key: "esnaf-kurulum" as const, label: "Esnaf Adına Kur" },
];

export function AdminNav({ current }: AdminNavProps) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Admin menüsü">
      {links.map((link) => {
        const isActive = current === link.key;
        return (
          <Link
            key={link.key}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`${adminBtnSecondaryClass} ${
              isActive ? "border-indigo-500/60 bg-indigo-950/40 text-indigo-100" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
