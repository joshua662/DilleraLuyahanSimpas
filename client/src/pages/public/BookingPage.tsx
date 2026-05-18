import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Loader2, MessageSquare, Bell, CheckCircle } from "lucide-react";
import BookingService from "../../services/BookingService";
import AddressAutocomplete from "../../components/booking/AddressAutocomplete";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { calculatePrice } from "../../utils/constants";
import { sendBookingSms } from "../../utils/sms";
import type { Booking } from "../../interfaces/types";

const BookingPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
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
    if (user) {
      setForm((f) => ({
        ...f,
        full_name: user.name || f.full_name,
        phone: user.phone || f.phone,
        email: user.email || f.email,
      }));
    }
  }, [user]);

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
    setConfirmed(null);
    try {
      const res = await BookingService.create(form);
      const booking = res.data.booking;
      setConfirmed(booking);
      showToast(res.data.notification?.message || "Booking created successfully!");
      if (user) {
        await refreshNotifications();
      }
      setForm((f) => ({ ...f, address: "", notes: "", pickup_date: "" }));
    } catch (err: unknown) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="py-16 max-w-2xl mx-auto px-4 sm:px-6 pb-28 md:pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-navy dark:text-white mb-2">Book Pickup</h1>
        <p className="text-muted mb-2">Fill in your details and we&apos;ll handle the rest.</p>
        {user && (
          <p className="text-sm text-sky mb-6">
            <Link to="/dashboard" className="font-medium hover:underline">Dashboard</Link>
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
              <Link to={`/track?code=${confirmed.tracking_code}`}
                className="px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-dark">
                Track Order
              </Link>
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
                {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Laundry Weight (kg)</label>
            <input
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={form.weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              onBlur={() => {
                if (form.weight < 1) setForm((f) => ({ ...f, weight: 1 }));
              }}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            <p className="text-sm text-sky font-semibold mt-2">Estimated total: ₱{calculatePrice(form.weight).toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Payment Method</label>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none">
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
              <option value="card">Card</option>
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
