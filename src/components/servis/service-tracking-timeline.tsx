import {
  Check,
  CheckCircle,
  Package,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  getServiceTrackingStepIndex,
  SERVICE_TRACKING_STEPS,
} from "@/lib/constants/service-status";
import { cn } from "@/lib/utils/cn";

type StepVisualState = "completed" | "current" | "pending";

const STEP_ICONS: LucideIcon[] = [Search, Wrench, CheckCircle, Package];

function getStepState(stepIndex: number, activeIndex: number): StepVisualState {
  if (stepIndex < activeIndex) return "completed";
  if (stepIndex === activeIndex) return "current";
  return "pending";
}

function TimelineIndicator({
  state,
  isFirst,
  isLast,
  lineBelowActive,
}: {
  state: StepVisualState;
  isFirst: boolean;
  isLast: boolean;
  lineBelowActive: boolean;
}) {
  const lineAboveActive = state !== "pending";

  return (
    <div className="flex h-full w-10 shrink-0 flex-col items-center">
      <div
        className={cn(
          "w-0.5 flex-1 min-h-3 transition-colors",
          isFirst ? "bg-transparent" : lineAboveActive ? "bg-emerald-300" : "bg-gray-200"
        )}
      />
      <div
        className={cn(
          "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          state === "completed" &&
            "border-emerald-500 bg-white text-emerald-600",
          state === "current" &&
            "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
          state === "pending" && "border-transparent bg-gray-200"
        )}
      >
        {(state === "completed" || state === "current") && (
          <Check className="size-3.5 stroke-[3]" aria-hidden />
        )}
      </div>
      <div
        className={cn(
          "w-0.5 flex-1 min-h-3 transition-colors",
          isLast ? "bg-transparent" : lineBelowActive ? "bg-emerald-300" : "bg-gray-200"
        )}
      />
    </div>
  );
}

function StepCard({
  subtitle,
  title,
  state,
  icon: Icon,
}: {
  subtitle: string;
  title: string;
  state: StepVisualState;
  icon: LucideIcon;
}) {
  const isActive = state !== "pending";

  return (
    <div
      className={cn(
        "flex min-h-[4.5rem] flex-1 items-center gap-4 rounded-2xl border px-4 py-3.5 transition-colors sm:px-5 sm:py-4",
        isActive
          ? "border-emerald-100/80 bg-emerald-50"
          : "border-gray-100 bg-gray-50"
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          isActive ? "bg-white text-emerald-600 shadow-sm" : "bg-gray-100 text-gray-400"
        )}
      >
        <Icon className="size-5 stroke-[1.75]" aria-hidden />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            isActive ? "text-gray-500" : "text-gray-400"
          )}
        >
          {subtitle}
        </p>
        <p
          className={cn(
            "mt-0.5 text-base font-bold tracking-tight sm:text-lg",
            isActive ? "text-gray-900" : "text-gray-500"
          )}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

export function ServiceTrackingTimeline({ status }: { status: string }) {
  const activeIndex = getServiceTrackingStepIndex(status);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gray-900">
        Servis Durumu
      </h2>

      <div className="mt-5 space-y-3 sm:mt-6">
        {SERVICE_TRACKING_STEPS.map((step, index) => {
          const state = getStepState(index, activeIndex);
          const Icon = STEP_ICONS[index];
          const lineBelowActive = index < activeIndex;

          return (
            <div key={step.key} className="flex items-stretch gap-3 sm:gap-4">
              <StepCard
                subtitle={step.subtitle}
                title={step.label}
                state={state}
                icon={Icon}
              />
              <TimelineIndicator
                state={state}
                isFirst={index === 0}
                isLast={index === SERVICE_TRACKING_STEPS.length - 1}
                lineBelowActive={lineBelowActive}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
