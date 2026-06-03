import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";
import type { Booking } from "../../interfaces/types";
import AdminService from "../../services/AdminService";
import { useToast } from "../../contexts/ToastContext";
import {
  calculatePrice,
  CUSTOMER_TYPES,
  formatPickupTime12h,
  PAYMENT_METHODS,
  PICKUP_TIME_SLOTS,
  todayDateInputValue,
  toDateInputValue,
} from "../../utils/constants";
import { getApiErrorMessage } from "../../utils/apiError";

type FormState = {
  customer_type: "walk_in" | "pick_up";
  full_name: string;
  phone: string;
  email: string;
  address: string;
  pickup_date: string;
  pickup_time: string;
  weight: number;
  notes: string;
  latitude: number | undefined;
  longitude: number | undefined;
};

const emptyForm = (): FormState => ({
  customer_type: "walk_in",
  full_name: "",
  phone: "",
  email: "",
  address: "",
  pickup_date: "",
  pickup_time: "10:00",
  weight: 8,
  notes: "",
  latitude: undefined,
  longitude: undefined,
});

interface Props {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const AdminBookingFormModal = ({ booking, open, onClose, onSaved }: Props) => {
  const isCreate = !booking;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (booking) {
      const type = booking.customer_type === "pick_up" ? "pick_up" : "walk_in";
      setForm({
        customer_type: type,
        full_name: booking.full_name,
        phone: booking.phone,
        email: booking.email ?? "",
        address: booking.address,
        pickup_date: toDateInputValue(booking.pickup_date),
        pickup_time: booking.pickup_time || "10:00",
        weight: booking.weight,
        notes: booking.notes || "",
        latitude: booking.latitude,
        longitude: booking.longitude,
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [booking, open]);

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

  const buildPayload = () => ({
    customer_type: form.customer_type,
    full_name: form.full_name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || undefined,
    address: form.address.trim(),
    pickup_date: form.pickup_date,
    pickup_time: form.pickup_time,
    weight: form.weight,
    notes: form.notes.trim() || undefined,
    payment_method: "cash",
    latitude: form.latitude,
    longitude: form.longitude,
  });

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isCreate) {
        const res = await AdminService.createBooking(buildPayload());
        showToast("Booking created successfully");
        const saved = res.data.booking;
        if (saved) {
          setForm((f) => ({
            ...f,
            pickup_date: toDateInputValue(saved.pickup_date) || f.pickup_date,
            pickup_time: saved.pickup_time || f.pickup_time,
          }));
        }
      } else {
        const res = await AdminService.updateBooking(booking.id, buildPayload());
        showToast("Booking updated successfully");
        const saved = res.data.booking;
        if (saved) {
          setForm((f) => ({
            ...f,
            pickup_date: toDateInputValue(saved.pickup_date) || f.pickup_date,
            pickup_time: saved.pickup_time || f.pickup_time,
          }));
        }
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, isCreate ? "Failed to create booking" : "Cannot edit this booking"), "error");
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
                {!isCreate && <p className="text-xs text-muted font-mono">{booking.booking_number}</p>}
                <h2 className="font-bold text-lg">{isCreate ? "New Booking" : "Edit Booking"}</h2>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Type</label>
                <select
                  value={form.customer_type}
                  onChange={(e) =>
                    setForm({ ...form, customer_type: e.target.value as "walk_in" | "pick_up" })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                >
                  {CUSTOMER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                />
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
                  <label className="flex items-center gap-1 text-sm font-medium mb-1">
                    <Calendar className="w-4 h-4" /> Pickup Date
                  </label>
                  <input
                    type="date"
                    value={form.pickup_date}
                    min={isCreate ? todayDateInputValue() : undefined}
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
                  step={0.1}
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
                />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                <p className="text-sm text-sky font-semibold mt-1">Estimated: ₱{calculatePrice(form.weight).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value="cash"
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-slate-100 dark:bg-slate-900/80 text-muted cursor-not-allowed outline-none"
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
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : isCreate ? (
                  "Create Booking"
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminBookingFormModal;
