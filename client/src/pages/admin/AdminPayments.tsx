import { useEffect, useState } from "react";
import AdminService from "../../services/AdminService";
import type { Booking, Payment } from "../../interfaces/types";
import { useToast } from "../../contexts/ToastContext";
import Skeleton from "../../components/ui/Skeleton";

const AdminPayments = () => {
  const [payments, setPayments] = useState<(Payment & { booking: Booking })[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    AdminService.payments()
      .then((res) => setPayments(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id: number) => {
    try {
      await AdminService.updatePayment(id, { payment_status: "paid" });
      showToast("Payment marked as paid");
      load();
    } catch {
      showToast("Update failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy dark:text-white">Payment Tracking</h2>
      <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-border dark:border-slate-700 overflow-x-auto">
        {loading ? <div className="p-6"><Skeleton className="h-32" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>{["Booking", "Customer", "Amount", "Method", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border dark:border-slate-700">
                  <td className="px-4 py-3 font-mono text-xs">{p.booking?.tracking_code}</td>
                  <td className="px-4 py-3">{p.booking?.full_name}</td>
                  <td className="px-4 py-3 font-semibold">₱{p.amount}</td>
                  <td className="px-4 py-3 capitalize">{p.payment_method}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.payment_status === "pending" && (
                      <button onClick={() => void markPaid(p.id)} className="text-xs px-3 py-1 bg-navy text-white rounded-lg hover:bg-navy-dark">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !payments.length && <p className="p-8 text-center text-muted">No payments yet</p>}
      </div>
    </div>
  );
};

export default AdminPayments;
