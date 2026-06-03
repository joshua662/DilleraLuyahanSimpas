import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import AdminService from "../../services/AdminService";
import type { User } from "../../interfaces/types";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../utils/apiError";
import PasswordInput from "../../components/ui/PasswordInput";
import Skeleton from "../../components/ui/Skeleton";

type CustomerForm = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password: string;
};

const emptyForm = (): CustomerForm => ({
  name: "",
  email: "",
  phone: "",
  password: "",
});

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<(User & { bookings_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [editing, setEditing] = useState<CustomerForm | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    AdminService.customers({ search, page })
      .then((res) => {
        setCustomers(res.data.data);
        setLastPage(res.data.last_page);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search, page]);

  const save = async () => {
    if (!editing?.name.trim() || !editing.email.trim()) {
      showToast("Name and email are required", "error");
      return;
    }
    if (!editing.id && editing.password && editing.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    if (editing.id && editing.password && editing.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: editing.name.trim(),
        email: editing.email.trim(),
        phone: editing.phone.trim() || undefined,
        ...(editing.password ? { password: editing.password } : {}),
      };

      if (editing.id) {
        await AdminService.updateCustomer(editing.id, payload);
        showToast("Customer updated");
      } else {
        await AdminService.createCustomer(payload);
        showToast("Customer created");
      }
      setEditing(null);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Save failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: User & { bookings_count: number }) => {
    const msg =
      c.bookings_count > 0
        ? `Delete ${c.name}? Their ${c.bookings_count} order(s) will remain but won't be linked to this customer.`
        : `Delete ${c.name}?`;
    if (!confirm(msg)) return;
    try {
      await AdminService.deleteCustomer(c.id);
      showToast("Customer deleted");
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Delete failed"), "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-navy dark:text-white">Customers</h2>
        <button
          onClick={() => setEditing(emptyForm())}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {editing && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow border border-border dark:border-slate-700 space-y-4">
          <h3 className="font-semibold text-navy dark:text-white">{editing.id ? "Edit" : "New"} Customer</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              placeholder="Full name"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 outline-none focus:ring-2 focus:ring-sky"
            />
            <input
              type="email"
              placeholder="Email"
              value={editing.email}
              onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 outline-none focus:ring-2 focus:ring-sky"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={editing.phone}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 outline-none focus:ring-2 focus:ring-sky"
            />
            <div>
              <PasswordInput
                placeholder={editing.id ? "New password (optional)" : "Password (optional)"}
                value={editing.password}
                onChange={(e) => setEditing({ ...editing, password: e.target.value })}
              />
              <p className="text-xs text-muted mt-1">
                {editing.id ? "Leave blank to keep current password." : "Leave blank to auto-generate."}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void save()}
              disabled={saving}
              className="px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sky"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-border dark:border-slate-700 overflow-x-auto">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-32" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Name", "Email", "Phone", "Orders", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-border dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{c.bookings_count}</td>
                  <td className="px-4 py-3 text-muted">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setEditing({
                            id: c.id,
                            name: c.name,
                            email: c.email,
                            phone: c.phone || "",
                            password: "",
                          })
                        }
                        className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => void remove(c)}
                        className="p-1.5 rounded-lg border text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !customers.length && <p className="p-8 text-center text-muted">No customers found</p>}
      </div>

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg border disabled:opacity-40">
            Prev
          </button>
          <span className="px-4 py-2">
            {page} / {lastPage}
          </span>
          <button disabled={page >= lastPage} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg border disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
