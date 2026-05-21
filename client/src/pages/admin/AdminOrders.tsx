import { useEffect, useState } from "react";
import { Search, FileDown, Eye, CheckCircle, XCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import AdminService from "../../services/AdminService";
import type { Booking } from "../../interfaces/types";
import { formatPickupSchedule, STATUS_LABELS } from "../../utils/constants";
import { useToast } from "../../contexts/ToastContext";
import Skeleton from "../../components/ui/Skeleton";
import StatusBadge from "../../components/booking/StatusBadge";
import BookingCard from "../../components/booking/BookingCard";
import BookingModal from "../../components/booking/BookingModal";
import type { BookingStatus } from "../../interfaces/types";

const AdminOrders = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [doneFilter, setDoneFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    AdminService.bookings({
      search,
      status: statusFilter,
      page,
      is_done: doneFilter === "" ? undefined : doneFilter === "true",
    })
      .then((res) => {
        setBookings(res.data.data);
        setLastPage(res.data.last_page);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter, doneFilter, page]);

  const exportPdf = (b: Booking) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MD & V Laundry Shop", 20, 20);
    doc.setFontSize(12);
    doc.text(`Booking: ${b.booking_number}`, 20, 35);
    doc.text(`Customer: ${b.full_name}`, 20, 45);
    doc.text(`Phone: ${b.phone}`, 20, 55);
    doc.text(`Status: ${STATUS_LABELS[b.status]}`, 20, 65);
    doc.text(`Pickup: ${formatPickupSchedule(b.pickup_date, b.pickup_time)}`, 20, 75);
    doc.text(`Total: PHP ${b.total_price}`, 20, 85);
    doc.text(`Tracking: ${b.tracking_code}`, 20, 95);
    doc.save(`${b.booking_number}.pdf`);
    showToast("PDF downloaded");
  };

  const openModal = (b: Booking) => {
    setSelected(b);
    setModalOpen(true);
  };

  const handleFinish = async (b: Booking) => {
    if (!confirm(`Mark ${b.booking_number} as Finished? Customer will receive an SMS.`)) return;
    setActionLoading(b.id);
    try {
      await AdminService.markDone(b.id);
      showToast("Marked as Finished — SMS sent");
      load();
    } catch {
      showToast("Failed to update booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (b: Booking) => {
    if (!confirm(`Cancel ${b.booking_number}? Customer will be notified via SMS.`)) return;
    setActionLoading(b.id);
    try {
      await AdminService.cancelBooking(b.id);
      showToast("Booking cancelled — customer notified");
      load();
    } catch {
      showToast("Cannot cancel this booking", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const isLocked = (b: Booking) =>
    b.is_finished || b.is_done || b.status === "done" || b.status === "cancelled";

  const handleStatusSelect = async (booking: Booking, status: BookingStatus) => {
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
      load();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy dark:text-white">Manage Bookings</h2>
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search bookings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sky" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-800">
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={doneFilter} onChange={(e) => { setDoneFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-800">
          <option value="">Done / Not Done</option>
          <option value="true">Done</option>
          <option value="false">Not Done</option>
        </select>
      </div>

      <div className="grid gap-4 lg:hidden">
        {loading ? (
          <Skeleton className="h-40" />
        ) : (
          bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              showActions
              onEdit={!isLocked(b) ? () => openModal(b) : undefined}
              onCancel={!isLocked(b) ? () => void handleCancel(b) : undefined}
              onStatusSelect={!isLocked(b) ? (s) => void handleStatusSelect(b, s) : undefined}
              statusUpdating={statusUpdatingId === b.id}
            />
          ))
        )}
        {!loading && !bookings.length && <p className="text-center text-muted py-8">No bookings found</p>}
      </div>

      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-border dark:border-slate-700 overflow-x-auto">
        {loading ? <div className="p-6"><Skeleton className="h-48" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Booking #", "Customer", "Pickup", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-mono text-xs">{b.booking_number}<br /><span className="text-muted">{b.tracking_code}</span></td>
                  <td className="px-4 py-3">{b.full_name}<br /><span className="text-muted text-xs">{b.phone}</span></td>
                  <td className="px-4 py-3">{formatPickupSchedule(b.pickup_date, b.pickup_time)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} done={b.is_done} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => openModal(b)} className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-700" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => exportPdf(b)} className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-700" title="Export PDF">
                        <FileDown className="w-4 h-4" />
                      </button>
                      {!isLocked(b) && (
                        <>
                          <button
                            onClick={() => void handleFinish(b)}
                            disabled={actionLoading === b.id}
                            className="px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium flex items-center gap-1 hover:bg-emerald-700 disabled:opacity-60"
                            title="Finish"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Finish
                          </button>
                          <button
                            onClick={() => void handleCancel(b)}
                            disabled={actionLoading === b.id}
                            className="px-2 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium flex items-center gap-1 hover:bg-red-700 disabled:opacity-60"
                            title="Cancel"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !bookings.length && <p className="p-8 text-center text-muted">No bookings found</p>}
      </div>

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg border disabled:opacity-40">Prev</button>
          <span className="px-4 py-2">{page} / {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg border disabled:opacity-40">Next</button>
        </div>
      )}

      <BookingModal booking={selected} open={modalOpen} onClose={() => setModalOpen(false)} onUpdated={load} />
    </div>
  );
};

export default AdminOrders;
