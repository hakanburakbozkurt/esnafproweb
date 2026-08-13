import { LandingFooter } from "@/components/landing/landing-footer";

export default function StoreSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <LandingFooter />
    </>
  );
}
