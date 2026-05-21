import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";
import type { Booking } from "../../interfaces/types";
import BookingService from "../../services/BookingService";
import { useToast } from "../../contexts/ToastContext";
import {
  calculatePrice,
  formatPickupTime12h,
  PAYMENT_METHODS,
  PICKUP_TIME_SLOTS,
} from "../../utils/constants";

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EditBookingModal = ({ booking, open, onClose, onSaved }: Props) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
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
    setForm({
      full_name: booking.full_name,
      phone: booking.phone,
      address: booking.address,
      pickup_date: booking.pickup_date || "",
      pickup_time: booking.pickup_time || "10:00",
      weight: booking.weight,
      notes: booking.notes || "",
      payment_method: booking.payment_method === "gcash" ? "gcash" : "cash",
      latitude: booking.latitude,
      longitude: booking.longitude,
    });
    setErrors({});
  }, [booking, open]);

  if (!booking) return null;

  const handleWeightChange = (raw: string) => {
    if (raw === "") {
      setForm((f) => ({ ...f, weight: 0 }));
      return;
    }
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed) || parsed < 0) {
      setForm((f) => ({ ...f, weight: 0 }));
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
    if (form.weight < 0) e.weight = "Weight cannot be negative";
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
                    {PICKUP_TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {formatPickupTime12h(t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
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
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
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
