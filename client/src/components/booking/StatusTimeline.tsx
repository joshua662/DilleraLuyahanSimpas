import { motion } from "framer-motion";
import { CheckCircle2, Circle, XCircle, Loader2 } from "lucide-react";
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
      <div className={`space-y-1 pr-1 ${compact ? "" : "max-h-80 overflow-y-auto"}`}>
        {BOOKING_STATUSES.map((step, i) => {
          const checked = i <= currentStep || finished;
          const active = i === currentStep && !finished;
          const isFuture = i > currentStep && !finished;
          const canClick = interactive && !updating;

          const rowClass = [
            "flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 transition",
            checked && !active ? "opacity-100" : "",
            isFuture && !interactive ? "opacity-35" : "",
            isFuture && interactive ? "opacity-60 hover:opacity-100" : "",
            active ? "bg-sky/10 dark:bg-sky/20" : "",
            canClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50" : "",
            updating ? "pointer-events-none opacity-50" : "",
          ].join(" ");

          const content = (
            <>
              {checked ? (
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${active ? "text-sky" : "text-emerald-500"}`}
                />
              ) : (
                <Circle className="w-5 h-5 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
              <span
                className={`text-sm font-medium flex-1 ${
                  active ? "text-sky" : checked ? "text-navy dark:text-slate-200" : "text-muted"
                }`}
              >
                {step.label}
              </span>
              {updating && active && <Loader2 className="w-4 h-4 animate-spin text-sky" />}
            </>
          );

          if (interactive && onStatusSelect) {
            return (
              <button
                key={step.key}
                type="button"
                disabled={!canClick}
                onClick={() => handleStepClick(step.key as BookingStatus)}
                className={rowClass}
                title={canClick ? `Set status to ${step.label}` : undefined}
              >
                {content}
              </button>
            );
          }

          return (
            <motion.div
              key={step.key}
              initial={animate ? { opacity: 0, x: -10 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={rowClass}
            >
              {content}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
