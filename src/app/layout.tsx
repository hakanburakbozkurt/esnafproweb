import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
});

const siteDescription =
  "Toptancı, esnaf ve son kullanıcılar için dijital yönetim platformu";

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: "EsnafPRO",
  description: siteDescription,
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
