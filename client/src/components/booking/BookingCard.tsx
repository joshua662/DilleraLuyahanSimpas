import { motion } from "framer-motion";
import { Calendar, MapPin, Scale, CheckCircle2, Trash2 } from "lucide-react";
import type { Booking, BookingStatus } from "../../interfaces/types";
import StatusBadge from "./StatusBadge";
import StatusTimeline from "./StatusTimeline";

interface Props {
  booking: Booking;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  showActions?: boolean;
  /** Admin/staff: tap status to notify customer */
  onStatusSelect?: (status: BookingStatus) => void;
  statusUpdating?: boolean;
}

const isFinished = (b: Booking) =>
  b.is_finished || b.is_done || b.status === "done" || b.status === "delivered";

const BookingCard = ({
  booking,
  onEdit,
  onCancel,
  onDelete,
  deleteLabel = "Delete",
  showActions,
  onStatusSelect,
  statusUpdating = false,
}: Props) => {
  const locked = booking.status === "cancelled" || isFinished(booking);
  const canMarkStatus = !!onStatusSelect && !locked;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 card-shadow border border-border dark:border-slate-700"
    >
      <motion.div className="flex flex-wrap justify-between items-start gap-2 mb-4">
        <div>
          <p className="text-xs text-muted font-mono">{booking.booking_number}</p>
          <h3 className="font-bold text-lg">{booking.full_name}</h3>
        </div>
        <StatusBadge status={booking.status} done={booking.is_done} />
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted mb-4">
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky" /> {booking.pickup_date} @ {booking.pickup_time}
        </p>
        <p className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-sky" /> {booking.weight} kg — ₱{booking.total_price}
        </p>
        <p className="flex items-center gap-2 sm:col-span-2">
          <MapPin className="w-4 h-4 text-sky shrink-0" /> {booking.address}
        </p>
      </div>

      {isFinished(booking) && (
        <motion.div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Your laundry is finished! Ready for pickup or delivery.
          </p>
        </motion.div>
      )}

      {booking.status !== "cancelled" && (
        <div className="mb-4">
          <StatusTimeline
            status={booking.status}
            isDone={booking.is_done}
            animate={false}
            compact
            interactive={canMarkStatus}
            updating={statusUpdating}
            onStatusSelect={onStatusSelect}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {showActions && (booking.can_edit ?? true) && !isFinished(booking) && booking.status !== "cancelled" && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs px-3 py-1.5 border border-sky/40 text-sky rounded-lg hover:bg-sky-light dark:hover:bg-sky/10 font-medium"
          >
            Edit
          </button>
        )}
        {showActions && booking.can_cancel && onCancel && booking.status !== "cancelled" && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Cancel
          </button>
        )}
        {booking.status === "cancelled" && (
          <span className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg bg-red-50/50 dark:bg-red-900/10">
            Cancelled
          </span>
        )}
        {onDelete && booking.status === "cancelled" && (booking.can_delete ?? true) && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-1 font-semibold shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" /> {deleteLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BookingCard;
