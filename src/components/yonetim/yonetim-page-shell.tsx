import type { ComponentProps } from "react";
import { SubPageShell } from "@/components/layout/sub-page-shell";
import { YonetimSubNav } from "@/components/yonetim/yonetim-sub-nav";

type YonetimPageShellProps = ComponentProps<typeof SubPageShell> & {
  /** Mağaza açıkken alt navigasyonu göster */
  showYonetimNav?: boolean;
};

export function YonetimPageShell({
  showYonetimNav = true,
  subNav,
  ...props
}: YonetimPageShellProps) {
  return (
    <SubPageShell
      {...props}
      subNav={
        showYonetimNav ? (
          <>
            {subNav}
            <YonetimSubNav />
          </>
        ) : (
          subNav
        )
      }
    />
  );
}
