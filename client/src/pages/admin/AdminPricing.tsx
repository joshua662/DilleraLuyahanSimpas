import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminService from "../../services/AdminService";
import type { Service } from "../../interfaces/types";
import { useToast } from "../../contexts/ToastContext";
import Skeleton from "../../components/ui/Skeleton";

const AdminPricing = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    AdminService.services().then((res) => setServices(res.data.services)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name) return;
    try {
      if (editing.id) {
        await AdminService.updateService(editing.id, editing);
        showToast("Service updated");
      } else {
        await AdminService.createService(editing);
        showToast("Service created");
      }
      setEditing(null);
      load();
    } catch {
      showToast("Save failed", "error");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    await AdminService.deleteService(id);
    showToast("Service deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy dark:text-white">Manage Pricing & Services</h2>
        <button onClick={() => setEditing({ name: "", description: "", price: 0, icon: "droplets", is_active: true })}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {editing && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow border border-border dark:border-slate-700 space-y-4">
          <h3 className="font-semibold">{editing.id ? "Edit" : "New"} Service</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input placeholder="Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="px-4 py-2 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900" />
            <input type="number" placeholder="Price" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              className="px-4 py-2 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900" />
            <textarea placeholder="Description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="sm:col-span-2 px-4 py-2 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900" rows={2} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => void save()} className="px-4 py-2 bg-navy text-white rounded-xl text-sm">Save</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <Skeleton className="h-48" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 card-shadow border border-border dark:border-slate-700">
              <h3 className="font-bold text-lg">{s.name}</h3>
              <p className="text-2xl font-black text-sky my-2">₱{s.price}</p>
              <p className="text-muted text-sm mb-4">{s.description}</p>
              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => void remove(s.id)} className="p-2 rounded-lg border text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
