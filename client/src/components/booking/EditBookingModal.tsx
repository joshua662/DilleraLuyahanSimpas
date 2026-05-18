import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";
import StatusTimeline from "./StatusTimeline";
import type { Booking, BookingStatus } from "../../interfaces/types";
import BookingService from "../../services/BookingService";
import AdminService from "../../services/AdminService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { calculatePrice, STATUS_LABELS } from "../../utils/constants";

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const isFinished = (b: Booking) =>
  b.is_finished || b.is_done || b.status === "done" || b.status === "delivered";

const EditBookingModal = ({ booking, open, onClose, onSaved }: Props) => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [status, setStatus] = useState<BookingStatus>("pending");
  const [isDone, setIsDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    pickup_date: "",
    pickup_time: "10:00",
    weight: 1,
    notes: "",
    payment_method: "cash",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!booking || !open) return;
    setStatus(booking.status);
    setIsDone(booking.is_done);
    setForm({
      full_name: booking.full_name,
      phone: booking.phone,
      address: booking.address,
      pickup_date: booking.pickup_date,
      pickup_time: booking.pickup_time,
      weight: booking.weight,
      notes: booking.notes || "",
      payment_method: booking.payment_method || "cash",
      latitude: booking.latitude,
      longitude: booking.longitude,
    });
    setErrors({});
  }, [booking, open]);

  if (!booking) return null;

  const canUpdateStatus = isAdmin && booking.status !== "cancelled" && !isFinished(booking);

  const handleStatusSelect = async (newStatus: BookingStatus) => {
    if (!isAdmin) {
      showToast("Only laundry staff can update order status", "error");
      return;
    }
    const label = STATUS_LABELS[newStatus] || newStatus;
    if (!confirm(`Set status to "${label}"? Customer will be notified.`)) return;

    setStatusUpdating(true);
    try {
      if (newStatus === "done") {
        await AdminService.markDone(booking.id);
        setStatus("done");
        setIsDone(true);
        showToast("Marked as Finished — customer notified");
      } else {
        await AdminService.updateBookingStatus(booking.id, newStatus);
        setStatus(newStatus);
        showToast(`Status: ${label} — customer notified`);
      }
      onSaved();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleWeightChange = (raw: string) => {
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed) || parsed < 1) {
      setForm((f) => ({ ...f, weight: 1 }));
      return;
    }
    setForm((f) => ({ ...f, weight: Math.min(100, parsed) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.pickup_date) e.pickup_date = "Pickup date is required";
    if (form.weight < 1) e.weight = "Minimum weight is 1 kg";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await BookingService.update(booking.id, form);
      showToast("Booking updated successfully");
      onSaved();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || "Cannot edit this booking", "error");
    } finally {
      setLoading(false);
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
                <p className="text-xs text-muted font-mono">{booking.booking_number}</p>
                <h2 className="font-bold text-lg">Edit Booking</h2>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {booking.status !== "cancelled" && (
                <div className="pb-4 border-b border-border dark:border-slate-700">
                  <label className="block text-sm font-medium mb-2">Order Status</label>
                  <StatusTimeline
                    status={status}
                    isDone={isDone}
                    animate={false}
                    compact
                    interactive={canUpdateStatus}
                    updating={statusUpdating}
                    onStatusSelect={(s) => void handleStatusSelect(s)}
                  />
                  {!isAdmin && (
                    <p className="text-xs text-muted mt-2">
                      Status updates are done by the laundry shop. You will be notified when laundry is finished.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <AddressAutocomplete
                  value={form.address}
                  onChange={({ address, latitude, longitude }) =>
                    setForm((f) => ({ ...f, address, latitude, longitude }))
                  }
                  error={errors.address}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Pickup Date
                  </label>
                  <input
                    type="date"
                    value={form.pickup_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                  />
                  {errors.pickup_date && <p className="text-red-500 text-xs mt-1">{errors.pickup_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pickup Time</label>
                  <select
                    value={form.pickup_time}
                    onChange={(e) => setForm({ ...form, pickup_time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                  >
                    {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={form.weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                <p className="text-sm text-sky font-semibold mt-1">Estimated: ₱{calculatePrice(form.weight).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-dark disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditBookingModal;
