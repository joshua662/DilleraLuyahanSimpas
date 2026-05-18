import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constants";

const StatusBadge = ({ status, done }: { status: string; done?: boolean }) => {
  const finished = done || status === "done" || status === "delivered";
  const label = finished ? "Finished" : STATUS_LABELS[status] || status;
  const color = finished
    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
    : STATUS_COLORS[status] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label}
      {finished && <span className="ml-0.5">✓</span>}
    </span>
  );
};

export default StatusBadge;
