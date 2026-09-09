import Link from "next/link";
import { localAlertInfoClass } from "@/components/local-yonetim/local-admin-ui";

type LocalAuthNoticeProps = {
  canEdit: boolean;
  nextPath: string;
};

export function LocalAuthNotice({ canEdit, nextPath }: LocalAuthNoticeProps) {
  if (canEdit) return null;

  return (
    <p className={localAlertInfoClass}>
      Düzenleme için süper admin hesabıyla{" "}
      <Link
        href={`/giris?next=${encodeURIComponent(nextPath)}`}
        className="font-semibold underline"
      >
        giriş yapın
      </Link>
      .
    </p>
  );
}
