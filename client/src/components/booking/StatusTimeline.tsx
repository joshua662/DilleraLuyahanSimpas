import { motion } from "framer-motion";
import { ChevronRight, XCircle, Loader2 } from "lucide-react";
import { BOOKING_STATUSES, getStatusStep } from "../../utils/constants";
import type { BookingStatus } from "../../interfaces/types";

interface Props {
  status: BookingStatus;
  isDone?: boolean;
  animate?: boolean;
  /** Admin: click a step to update booking status and notify customer */
  interactive?: boolean;
  onStatusSelect?: (status: BookingStatus) => void;
  updating?: boolean;
  /** When false, shows all steps (e.g. Finished) without scrolling */
  compact?: boolean;
}

const StatusTimeline = ({
  status,
  isDone,
  animate = true,
  interactive = false,
  onStatusSelect,
  updating = false,
  compact = false,
}: Props) => {
  const currentStep = getStatusStep(status);
  const cancelled = status === "cancelled";
  const finished = status === "done" || status === "delivered" || isDone;

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-300">
        <XCircle className="w-6 h-6 shrink-0" />
        <p className="font-medium">This booking has been cancelled.</p>
      </div>
    );
  }

  const progress = finished
    ? 100
    : ((currentStep + 1) / BOOKING_STATUSES.length) * 100;

  const handleStepClick = (stepKey: BookingStatus) => {
    if (!interactive || !onStatusSelect || updating) return;
    onStatusSelect(stepKey);
  };

  return (
    <div className="space-y-4">
      {interactive && (
        <p className="text-xs text-muted">Tap a status to update the customer</p>
      )}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-navy to-sky rounded-full"
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className={`flex items-stretch gap-2 overflow-x-auto pb-1 snap-x cursor-grab active:cursor-grabbing ${compact ? "" : "max-w-full"}`}>
        {BOOKING_STATUSES.map((step, i) => {
          const checked = i <= currentStep || finished;
          const active = i === currentStep && !finished;
          const isFuture = i > currentStep && !finished;
          const canClick = interactive && !updating;

          const stepClass = [
            "shrink-0 snap-start inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition min-w-[132px] justify-center",
            checked && !active ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-200" : "",
            active ? "border-sky bg-sky/10 text-sky dark:bg-sky/20" : "",
            isFuture ? "border-slate-200 bg-slate-50 text-muted dark:border-slate-700 dark:bg-slate-900/40" : "",
            isFuture && !interactive ? "opacity-60" : "",
            isFuture && interactive ? "hover:border-sky hover:text-sky" : "",
            canClick ? "cursor-pointer" : "",
            updating ? "pointer-events-none opacity-50" : "",
          ].join(" ");

          const content = (
            <>
              <span>{step.label}</span>
              {updating && active && <Loader2 className="w-4 h-4 animate-spin text-sky" />}
            </>
          );

          const stepNode = interactive && onStatusSelect ? (
            <button
              type="button"
              disabled={!canClick}
              onClick={() => handleStepClick(step.key as BookingStatus)}
              className={stepClass}
              title={canClick ? `Set status to ${step.label}` : undefined}
            >
              {content}
            </button>
          ) : (
            <motion.div
              initial={animate ? { opacity: 0, x: -10 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={stepClass}
            >
              {content}
            </motion.div>
          );

          return (
            <div key={step.key} className="flex items-center gap-2">
              {stepNode}
              {i < BOOKING_STATUSES.length - 1 && (
                <ChevronRight className="w-5 h-5 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
