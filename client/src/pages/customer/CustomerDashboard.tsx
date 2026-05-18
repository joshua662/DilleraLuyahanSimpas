import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Package, Trash2, RotateCcw } from "lucide-react";
import BookingService from "../../services/BookingService";
import AdminService from "../../services/AdminService";
import type { Booking, BookingStatus } from "../../interfaces/types";
import BookingCard from "../../components/booking/BookingCard";
import EditBookingModal from "../../components/booking/EditBookingModal";
import { STATUS_LABELS } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useNotifications } from "../../contexts/NotificationContext";
import Skeleton from "../../components/ui/Skeleton";

/** Poll every 60s — background only, no full-page loading flash */
const POLL_INTERVAL_MS = 60_000;

const CustomerDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const showToastRef = useRef(showToast);
  const refreshNotifRef = useRef(refreshNotifications);
  showToastRef.current = showToast;
  refreshNotifRef.current = refreshNotifications;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trash, setTrash] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookings" | "trash">("bookings");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const prevStatuses = useRef<Record<number, string>>({});
  const prevDone = useRef<Record<number, boolean>>({});
  const isFirstLoad = useRef(true);

  const applyBookings = useCallback((list: Booking[]) => {
    list.forEach((b) => {
      const prev = prevStatuses.current[b.id];
      const wasDone = prevDone.current[b.id];
      const nowDone = b.is_finished || b.is_done || b.status === "done" || b.status === "delivered";

      if (prev !== undefined && prev !== b.status) {
        const label = STATUS_LABELS[b.status] || b.status.replace(/_/g, " ");
        if (nowDone) {
          showToastRef.current(`${b.booking_number}: Your laundry is finished!`, "info");
        } else {
          showToastRef.current(`${b.booking_number} is now ${label}`, "info");
        }
        void refreshNotifRef.current();
      } else if (prev !== undefined && !wasDone && nowDone) {
        showToastRef.current(`${b.booking_number}: Your laundry is finished!`, "info");
        void refreshNotifRef.current();
      }

      prevStatuses.current[b.id] = b.status;
      prevDone.current[b.id] = nowDone;
    });
    setBookings(list);
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (isAdmin) {
        const res = await AdminService.bookings({ per_page: 100 });
        applyBookings(res.data.data);
      } else {
        const res = await BookingService.myOrders();
        applyBookings(res.data.bookings);
      }
    } catch {
      if (!silent) showToastRef.current("Could not load bookings", "error");
    } finally {
      if (!silent) setLoading(false);
      isFirstLoad.current = false;
    }
  }, [applyBookings, isAdmin]);

  const handleStatusSelect = async (booking: Booking, status: BookingStatus) => {
    if (!isAdmin) {
      showToast("Only laundry staff can update order status", "error");
      return;
    }
    const label = STATUS_LABELS[status] || status;
    if (!confirm(`Set status to "${label}"? Customer will be notified.`)) return;

    setStatusUpdatingId(booking.id);
    try {
      if (status === "done") {
        await AdminService.markDone(booking.id);
        showToast("Marked as Finished — customer notified");
      } else {
        await AdminService.updateBookingStatus(booking.id, status);
        showToast(`Status: ${label} — customer notified`);
      }
      await refreshNotifications();
      void load(true);
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const loadTrash = useCallback(async () => {
    try {
      const res = await BookingService.myTrash();
      setTrash(res.data.bookings);
    } catch {
      setTrash([]);
    }
  }, []);

  useEffect(() => {
    void load(false);
    void loadTrash();
  }, [load, loadTrash]);

  useEffect(() => {
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      void load(true);
    };
    const id = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (tab === "trash") void loadTrash();
  }, [tab, loadTrash]);

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      if (isAdmin) {
        await AdminService.cancelBooking(id);
      } else {
        await BookingService.cancel(id);
      }
      showToast("Booking cancelled");
      await refreshNotifications();
      void load(true);
    } catch {
      showToast("Cannot cancel — laundry may already be finished", "error");
    }
  };

  const handleTrash = async (id: number) => {
    if (!confirm("Move this cancelled booking to trash?")) return;
    try {
      await BookingService.trash(id);
      showToast("Moved to trash");
      void load(true);
      void loadTrash();
    } catch {
      showToast("Only cancelled bookings can be deleted", "error");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await BookingService.restore(id);
      showToast("Booking restored");
      void load(true);
      void loadTrash();
    } catch {
      showToast("Could not restore booking", "error");
    }
  };

  const handleForceDelete = async (id: number) => {
    if (!confirm("Permanently delete? This cannot be undone.")) return;
    try {
      await BookingService.forceDelete(id);
      showToast("Booking permanently deleted");
      void loadTrash();
    } catch {
      showToast("Could not delete booking", "error");
    }
  };

  const active = bookings.filter(
    (b) => !b.is_finished && !b.is_done && b.status !== "done" && b.status !== "cancelled"
  );
  const completed = bookings.filter((b) => b.is_finished || b.is_done || b.status === "done");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <motion.div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 pb-28 md:pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white">{isAdmin ? "Manage Bookings" : "My Bookings"}</h1>
          <p className="text-muted">
            {isAdmin ? "Tap a status to notify the customer" : `Welcome back, ${user?.name}`}
          </p>
        </div>
        <Link to="/booking" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl font-semibold hover:bg-navy-dark">
          <Plus className="w-5 h-5" /> New Booking
        </Link>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: bookings.length },
          { label: "Active", value: active.length },
          { label: "Finished", value: completed.length },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 card-shadow border border-border dark:border-slate-700 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("bookings")}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === "bookings" ? "bg-navy text-white" : "bg-white dark:bg-slate-800 border border-border dark:border-slate-700"}`}
        >
          My Bookings
        </button>
        <button
          type="button"
          onClick={() => setTab("trash")}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${tab === "trash" ? "bg-navy text-white" : "bg-white dark:bg-slate-800 border border-border dark:border-slate-700"}`}
        >
          <Trash2 className="w-4 h-4" /> Trash
          {trash.length > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{trash.length}</span>
          )}
        </button>
      </div>

      {loading && isFirstLoad.current ? (
        <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : tab === "bookings" ? (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Active Bookings</h2>
              <div className="space-y-4">
                {active.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    showActions
                    onEdit={() => setEditing(b)}
                    onCancel={() => void handleCancel(b.id)}
                    onStatusSelect={isAdmin ? (s) => void handleStatusSelect(b, s) : undefined}
                    statusUpdating={statusUpdatingId === b.id}
                  />
                ))}
              </div>
            </section>
          )}
          {completed.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Finished</h2>
              <div className="space-y-4">
                {completed.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
          {cancelled.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Cancelled</h2>
              <div className="space-y-4">
                {cancelled.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    showActions
                    onDelete={() => void handleTrash(b.id)}
                    deleteLabel="Delete"
                  />
                ))}
              </div>
            </section>
          )}
          {bookings.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl card-shadow">
              <Package className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted mb-4">No bookings yet</p>
              <Link to="/booking" className="text-sky font-medium">Create your first booking →</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {trash.length === 0 ? (
            <p className="text-center text-muted py-12">Trash is empty</p>
          ) : (
            trash.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 card-shadow border border-border dark:border-slate-700 flex flex-wrap justify-between items-center gap-4"
              >
                <div>
                  <p className="font-mono text-xs text-muted">{b.booking_number}</p>
                  <p className="font-semibold">{b.full_name}</p>
                  <p className="text-sm text-muted">{b.pickup_date} · Cancelled</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleRestore(b.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-sky border border-sky/40 rounded-lg hover:bg-sky-light dark:hover:bg-sky/10"
                  >
                    <RotateCcw className="w-4 h-4" /> Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleForceDelete(b.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete forever
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <EditBookingModal
        booking={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={() => void load(true)}
      />
    </motion.div>
  );
};

export default CustomerDashboard;
