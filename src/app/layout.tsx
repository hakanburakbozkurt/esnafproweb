import { getPublicSiteUrl } from "@/lib/auth/site-url";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_SIZE,
} from "@/lib/seo/page-metadata";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  // 300 (font-light) hiçbir yerde kullanılmıyor; indirilmesin.
  weight: ["400", "500", "700"],
});

const siteTitle = "EsnafPRO";
const siteDescription =
  "Cep telefoncusu ve teknik servisler için ücretsiz dijital mağaza. Ürün, 2. el cihaz ve servis takibi tek panelde; müşterin seni Google'da bulsun.";

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const siteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteTitle,
  icons: {
    icon: [
      {
        url: "/favicon.png?v=2",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/favicon.png?v=2",
    apple: [
      {
        url: "/favicon.png?v=2",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    locale: "tr_TR",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: DEFAULT_OG_IMAGE_ALT, ...DEFAULT_OG_IMAGE_SIZE }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [DEFAULT_OG_IMAGE_PATH],
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
