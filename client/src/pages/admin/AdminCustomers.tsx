import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AdminService from "../../services/AdminService";
import type { User } from "../../interfaces/types";
import Skeleton from "../../components/ui/Skeleton";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<(User & { bookings_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    AdminService.customers({ search, page })
      .then((res) => {
        setCustomers(res.data.data);
        setLastPage(res.data.last_page);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy dark:text-white">Customers</h2>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sky" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-border dark:border-slate-700 overflow-x-auto">
        {loading ? <div className="p-6"><Skeleton className="h-32" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>{["Name", "Email", "Phone", "Orders", "Joined"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-border dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{c.bookings_count}</td>
                  <td className="px-4 py-3 text-muted">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !customers.length && <p className="p-8 text-center text-muted">No customers found</p>}
      </div>
      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg border disabled:opacity-40">Prev</button>
          <span className="px-4 py-2">{page} / {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg border disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
