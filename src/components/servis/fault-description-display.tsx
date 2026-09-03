import {
  formatLockDisplay,
  parseEmbeddedLockFromFaultDescription,
  stripEmbeddedLockFromFaultDescription,
} from "@/lib/servis/service-approval";

type FaultDescriptionDisplayProps = {
  faultDescription: string;
  lockType?: string | null;
  devicePassword?: string | null;
  patternLockData?: string | null;
};

export function FaultDescriptionDisplay({
  faultDescription,
  lockType,
  devicePassword,
  patternLockData,
}: FaultDescriptionDisplayProps) {
  const lockFromFields = formatLockDisplay(
    lockType,
    devicePassword,
    patternLockData
  );
  const embedded = parseEmbeddedLockFromFaultDescription(faultDescription);
  const lock = lockFromFields ?? embedded.lock;
  const faultText = lockFromFields
    ? stripEmbeddedLockFromFaultDescription(faultDescription, lock)
    : embedded.faultText;

  return (
    <div className="space-y-3">
      {faultText && <p className="whitespace-pre-wrap">{faultText}</p>}
      {lock && (
        <p>
          <span className="font-bold text-slate-900">{lock.label}</span>{" "}
          <span className="font-normal text-slate-800">{lock.value}</span>
        </p>
      )}
    </div>
  );
}
