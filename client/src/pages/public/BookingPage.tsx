import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Loader2, MessageSquare, Bell, CheckCircle } from "lucide-react";
import BookingService from "../../services/BookingService";
import AddressAutocomplete from "../../components/booking/AddressAutocomplete";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import {
  calculatePrice,
  formatPickupTime12h,
  PAYMENT_METHODS,
  PICKUP_TIME_SLOTS,
} from "../../utils/constants";
import { sendBookingSms } from "../../utils/sms";
import type { Booking } from "../../interfaces/types";
import type { User } from "../../interfaces/types";

type BookingForm = {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  pickup_date: string;
  pickup_time: string;
  weight: number;
  notes: string;
  payment_method: string;
  latitude: number | undefined;
  longitude: number | undefined;
};

const createInitialForm = (user: User | null): BookingForm => ({
  full_name: user?.name || "",
  phone: user?.phone || "",
  email: user?.email || "",
  address: "",
  pickup_date: "",
  pickup_time: "10:00",
  weight: 0,
  notes: "",
  payment_method: "cash",
  latitude: undefined,
  longitude: undefined,
});

const BookingPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [form, setForm] = useState<BookingForm>(() => createInitialForm(user));
  const [weightInput, setWeightInput] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setForm(createInitialForm(user));
    setWeightInput("0");
    setErrors({});
  }, [user]);

  useEffect(() => {
    resetForm();
  }, [user, resetForm]);

  const handleWeightChange = (raw: string) => {
    if (raw === "") {
      setWeightInput("");
      setForm((f) => ({ ...f, weight: 0 }));
      return;
    }
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setWeightInput(raw);
    const parsed = parseFloat(raw);
    setForm((f) => ({
      ...f,
      weight: Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)),
    }));
  };

  const handleWeightBlur = () => {
    if (weightInput === "" || weightInput === ".") {
      setWeightInput("0");
      setForm((f) => ({ ...f, weight: 0 }));
    }
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

  const getErrorMessage = (err: unknown): string => {
    const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const data = axiosErr.response?.data;
    if (data?.errors) {
      return Object.values(data.errors).flat().join(" ");
    }
    return data?.message || "Failed to create booking. Please try again.";
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await BookingService.create(form);
      const booking = res.data.booking;
      setConfirmed(booking);
      showToast(res.data.notification?.message || "Booking created successfully!");
      if (user) {
        await refreshNotifications();
      }
      resetForm();
    } catch (err: unknown) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="py-16 max-w-2xl mx-auto px-4 sm:px-6 pb-28 md:pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-navy dark:text-white mb-2">Booking Pickup</h1>
        <p className="text-muted mb-2">Fill in your details and we&apos;ll handle the rest.</p>
        {user && (
          <p className="text-sm text-sky mb-6">
            <Link to="/dashboard" className="font-medium hover:underline">Laundry Update</Link>
            {" "}— view bookings, cancel, delete, and see when laundry is finished.
          </p>
        )}
        {!user && <div className="mb-6" />}

        {confirmed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">Booking Confirmed!</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {user ? "A notification has been sent to your account." : "Save your tracking code below."}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
                <p className="text-muted text-xs">Booking Reference</p>
                <p className="font-mono font-bold">{confirmed.booking_number}</p>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
                <p className="text-muted text-xs">Tracking Code</p>
                <p className="font-mono font-bold text-sky">{confirmed.tracking_code}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => sendBookingSms(confirmed.booking_number, confirmed.tracking_code)}
                className="px-4 py-2 bg-sky text-navy rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-sky-light">
                <MessageSquare className="w-4 h-4" /> Send SMS
              </button>
              {user && (
                <Link to="/notifications"
                  className="px-4 py-2 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4" /> View Notifications
                </Link>
              )}
              <button
                type="button"
                onClick={() => setConfirmed(null)}
                className="px-4 py-2 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm font-medium"
              >
                Book another
              </button>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 card-shadow border border-border dark:border-slate-700 space-y-5">
          {[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "phone", label: "Phone Number", type: "tel" },
            { key: "email", label: "Email (optional)", type: "email" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <input type={type} value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none" />
              {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5">Pickup Address</label>
            <AddressAutocomplete
              value={form.address}
              onChange={({ address, latitude, longitude }) =>
                setForm((f) => ({ ...f, address, latitude, longitude }))
              }
              error={errors.address}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1"><Calendar className="w-4 h-4" /> Pickup Date</label>
              <input type="date" value={form.pickup_date} min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none" />
              {errors.pickup_date && <p className="text-red-500 text-xs mt-1">{errors.pickup_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Pickup Time</label>
              <select value={form.pickup_time} onChange={(e) => setForm({ ...form, pickup_time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none">
                {PICKUP_TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{formatPickupTime12h(t)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Laundry Weight (kg)</label>
            <input
              type="text"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => handleWeightChange(e.target.value)}
              onBlur={handleWeightBlur}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            <p className="text-sm text-sky font-semibold mt-2">Estimated total: ₱{calculatePrice(form.weight).toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Payment Method</label>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none">
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-navy text-white font-bold rounded-xl hover:bg-navy-dark transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : "Submit Booking"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BookingPage;
