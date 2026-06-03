import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import type { Booking, BookingStatus } from "../../interfaces/types";
import StatusBadge from "./StatusBadge";
import StatusTimeline from "./StatusTimeline";
import AdminService from "../../services/AdminService";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  formatPickupSchedule,
  formatPickupTime12h,
  PICKUP_TIME_SLOTS,
  STATUS_LABELS,
  toDateInputValue,
  toPickupTimeValue,
} from "../../utils/constants";

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (booking?: Booking) => void;
}

const BookingModal = ({ booking, open, onClose, onUpdated }: Props) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [displayStatus, setDisplayStatus] = useState<BookingStatus>("pending");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setScheduleLoading(false);
    }
    if (booking) {
      setDisplayStatus(booking.status);
      setPickupDate(toDateInputValue(booking.pickup_date));
      setPickupTime(toPickupTimeValue(booking.pickup_time) || PICKUP_TIME_SLOTS[2]);
    }
  }, [open, booking]);

  if (!booking) return null;

  const isLocked =
    booking.is_finished ||
    booking.is_done ||
    booking.status === "done" ||
    booking.status === "delivered" ||
    booking.status === "cancelled";

  const canEditSchedule =
    booking.status !== "cancelled" &&
    booking.status !== "delivered" &&
    booking.status !== "done" &&
    !booking.is_done;

  const handleStatusSelect = async (newStatus: BookingStatus) => {
    if (newStatus === booking.status && !booking.is_done) return;

    const label = STATUS_LABELS[newStatus] || newStatus;
    if (!confirm(`Update status to "${label}"? Customer will be notified.`)) return;

    setLoading(true);
    try {
      if (newStatus === "done") {
        await AdminService.markDone(booking.id);
        showToast("Marked as Delivered — payment recorded on dashboard");
      } else {
        await AdminService.updateBookingStatus(booking.id, newStatus);
        showToast(`Status updated to ${label} — customer notified`);
      }
      setDisplayStatus(newStatus);
      onUpdated();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    await handleStatusSelect("done");
    onClose();
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this booking? Customer will be notified via SMS.")) return;
    setLoading(true);
    try {
      await AdminService.cancelBooking(booking.id);
      showToast("Booking cancelled — customer notified");
      onUpdated();
      onClose();
    } catch {
      showToast("Cannot cancel this booking", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSave = async () => {
    if (!pickupDate || !pickupTime) {
      showToast("Select pickup date and time first", "error");
      return;
    }

    setScheduleLoading(true);
    try {
      const res = await AdminService.updateBooking(booking.id, {
        pickup_date: pickupDate,
        pickup_time: pickupTime,
      });
      setDisplayStatus(res.data.booking.status);
      const saved = res.data.booking;
      setDisplayStatus(saved.status);
      setPickupDate(toDateInputValue(saved.pickup_date) || pickupDate);
      setPickupTime(toPickupTimeValue(saved.pickup_time) || pickupTime);
      showToast("Pickup schedule saved - customer notified");
      onUpdated(saved);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Failed to save pickup schedule"), "error");
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto card-shadow"
          >
            <div className="flex items-center justify-between p-5 border-b border-border dark:border-slate-700">
              <div>
                <p className="text-xs text-muted font-mono">{booking.booking_reference || booking.booking_number}</p>
                <h2 className="font-bold text-lg">{booking.full_name}</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <StatusBadge status={displayStatus} done={booking.is_done || displayStatus === "done"} />

              {!isLocked ? (
                <StatusTimeline
                  status={displayStatus}
                  isDone={booking.is_done}
                  interactive
                  updating={loading}
                  onStatusSelect={(s) => void handleStatusSelect(s)}
                />
              ) : (
                <StatusTimeline status={displayStatus} isDone={booking.is_done} />
              )}

              <div className="text-sm space-y-1 text-muted">
                <p><strong>Phone:</strong> {booking.phone}</p>
                <p><strong>Address:</strong> {booking.address}</p>
                <p><strong>Pickup:</strong> {formatPickupSchedule(pickupDate || booking.pickup_date, pickupTime || booking.pickup_time)}</p>
                <p><strong>Tracking:</strong> {booking.tracking_code}</p>
              </div>

              {canEditSchedule && (
                <div className="rounded-xl border border-border dark:border-slate-700 p-4 space-y-3">
                  <p className="font-semibold text-sm text-navy dark:text-white">Pickup Schedule</p>
                  <p className="text-xs text-muted">Change date or time, then save. The customer will be notified.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      disabled={scheduleLoading}
                      className="w-full px-3 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-900 text-navy dark:text-white focus:ring-2 focus:ring-sky outline-none disabled:opacity-60"
                    />
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      disabled={scheduleLoading}
                      className="w-full px-3 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-900 text-navy dark:text-white focus:ring-2 focus:ring-sky outline-none disabled:opacity-60"
                    >
                      <option value="">Select time</option>
                      {PICKUP_TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {formatPickupTime12h(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleScheduleSave()}
                    disabled={scheduleLoading}
                    className="w-full py-2.5 bg-navy text-white rounded-xl font-semibold hover:bg-navy-dark disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {scheduleLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Pickup Schedule"}
                  </button>
                </div>
              )}

              {!isLocked && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => void handleFinish()}
                    disabled={loading}
                    className="py-4 bg-emerald-600 text-white rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-60 min-h-[80px]"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-8 h-8" />}
                    Finish
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCancel()}
                    disabled={loading}
                    className="py-4 bg-red-600 text-white rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-60 min-h-[80px]"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <XCircle className="w-8 h-8" />}
                    Cancel
                  </button>
                </div>
              )}

              {isLocked && (
                <p className="text-center text-sm text-muted py-2">This booking is locked (finished or cancelled).</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
