import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Download, CheckCircle2 } from "lucide-react";
import QRCode from "qrcode";
import BookingService from "../../services/BookingService";
import type { Booking } from "../../interfaces/types";
import StatusTimeline from "../../components/booking/StatusTimeline";
import StatusBadge from "../../components/booking/StatusBadge";
import { useToast } from "../../contexts/ToastContext";
import { formatPickupSchedule, getEstimatedCompletion } from "../../utils/constants";

const TrackPage = () => {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const { showToast } = useToast();
  const showQr = params.get("qr") === "1";

  const handleTrack = useCallback(async (trackCode?: string) => {
    const c = (trackCode || code).trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    try {
      const res = await BookingService.track(c);
      setBooking(res.data.booking);
      const url = `${window.location.origin}/track?code=${res.data.booking.tracking_code}`;
      const qr = await QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: "#0c2d6b" } });
      setQrUrl(qr);
    } catch {
      setBooking(null);
      showToast("Booking not found. Check your tracking code.", "error");
    } finally {
      setLoading(false);
    }
  }, [code, showToast]);

  useEffect(() => {
    if (params.get("code")) void handleTrack(params.get("code")!);
  }, []);

  useEffect(() => {
    if (!booking) return;
    const interval = setInterval(() => void handleTrack(booking.tracking_code), 20000);
    return () => clearInterval(interval);
  }, [booking?.tracking_code, handleTrack]);

  return (
    <motion.div className="py-16 max-w-2xl mx-auto px-4 sm:px-6 pb-28 md:pb-16">
      <h1 className="text-4xl font-bold text-navy dark:text-white mb-2 text-center">Track Your Order</h1>
      <p className="text-muted text-center mb-8">Live updates every 20 seconds</p>

      <div className="flex gap-2 mb-8">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Tracking code"
          className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sky outline-none uppercase font-mono" />
        <button onClick={() => void handleTrack()} disabled={loading}
          className="px-6 py-3 bg-navy text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-navy-dark disabled:opacity-60">
          <Search className="w-5 h-5" /> Track
        </button>
      </div>

      {booking && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 card-shadow border border-border dark:border-slate-700">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <p className="text-sm text-muted">Booking #</p>
              <p className="font-mono font-bold">{booking.booking_number}</p>
              <p className="text-sm text-muted mt-2">Tracking</p>
              <p className="font-mono text-xl text-sky">{booking.tracking_code}</p>
            </div>
            <StatusBadge status={booking.status} done={booking.is_done} />
          </div>

          {(showQr || qrUrl) && qrUrl && (
            <div className="flex flex-col items-center mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
              <p className="text-xs text-muted mt-2">Scan to track this order</p>
              <a href={qrUrl} download={`track-${booking.tracking_code}.png`} className="text-xs text-sky mt-2 flex items-center gap-1">
                <Download className="w-3 h-3" /> Download QR
              </a>
            </div>
          )}

          {(booking.is_finished || booking.is_done || booking.status === "done") && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-200">Your laundry is finished!</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Ready for pickup or delivery.</p>
              </div>
            </div>
          )}

          {!["done", "cancelled"].includes(booking.status) && !booking.is_done && (
            <div className="mb-4 p-3 bg-sky/10 border border-sky/30 rounded-xl text-sm">
              <span className="text-muted">Est. completion: </span>
              <span className="font-semibold text-navy dark:text-sky">{getEstimatedCompletion(booking.pickup_date)}</span>
            </div>
          )}

          <StatusTimeline status={booking.status} isDone={booking.is_done} />

          <div className="mt-6 pt-6 border-t border-border dark:border-slate-700 grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted">Customer</p><p className="font-medium">{booking.full_name}</p></div>
            <div><p className="text-muted">Total</p><p className="font-medium">₱{booking.total_price}</p></div>
            <div><p className="text-muted">Pickup</p><p className="font-medium">{formatPickupSchedule(booking.pickup_date, booking.pickup_time)}</p></div>
            <div><p className="text-muted">Weight</p><p className="font-medium">{booking.weight} kg</p></div>
            {booking.delivery_rider && (
              <div className="col-span-2"><p className="text-muted">Rider</p><p className="font-medium">{booking.delivery_rider}</p></div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrackPage;
