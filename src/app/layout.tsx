import { getPublicSiteUrl } from "@/lib/auth/site-url";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
});

const siteTitle = "EsnafPRO";
const siteDescription =
  "Telefon ve teknik servis esnafı için dijital vitrin, servis takibi, 2. el pazaryeri ve işletme yönetimi platformu. Kod bilmeden dakikalar içinde profesyonel mağaza sayfanızı açın.";

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteTitle,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "tr-TR": siteUrl,
    },
  },
  other: {
    "content-language": "tr",
  },
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${roboto.variable} h-full overflow-x-hidden antialiased`}>
      <body className="flex min-h-full max-w-full flex-col overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
