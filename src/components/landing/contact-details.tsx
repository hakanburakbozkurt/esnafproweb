import {
  SITE_CONTACT,
  SITE_CONTACT_LINKS,
} from "@/lib/site/contact";

const linkClass = "font-medium text-emerald-700 hover:text-emerald-800";

/** İletişim ve Hakkımızda sayfalarında kullanılan iletişim bilgisi listesi. */
export function ContactDetails() {
  return (
    <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
      <div className="grid gap-1 px-4 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
        <dt className="text-sm font-semibold text-slate-900">Telefon</dt>
        <dd className="text-sm text-slate-600 sm:text-base">
          <a href={SITE_CONTACT_LINKS.tel} className={linkClass}>
            {SITE_CONTACT.phoneDisplay}
          </a>
        </dd>
      </div>
      <div className="grid gap-1 px-4 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
        <dt className="text-sm font-semibold text-slate-900">WhatsApp</dt>
        <dd className="text-sm text-slate-600 sm:text-base">
          <a
            href={SITE_CONTACT_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            WhatsApp&apos;tan yaz
          </a>
        </dd>
      </div>
      <div className="grid gap-1 px-4 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
        <dt className="text-sm font-semibold text-slate-900">E-posta</dt>
        <dd className="min-w-0 break-words text-sm text-slate-600 sm:text-base">
          <a href={SITE_CONTACT_LINKS.mailto} className={linkClass}>
            {SITE_CONTACT.email}
          </a>
        </dd>
      </div>
      <div className="grid gap-1 px-4 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
        <dt className="text-sm font-semibold text-slate-900">Adres</dt>
        <dd className="text-sm leading-relaxed text-slate-600 sm:text-base">
          <address className="not-italic">
            {SITE_CONTACT.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a
            href={SITE_CONTACT_LINKS.maps}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} mt-2 inline-block`}
          >
            Yol tarifi al
          </a>
        </dd>
      </div>
    </dl>
  );
}
