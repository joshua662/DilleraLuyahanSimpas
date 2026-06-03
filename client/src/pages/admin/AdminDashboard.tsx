import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, Clock, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AdminService from "../../services/AdminService";
import type { Booking, DashboardStats } from "../../interfaces/types";
import { STATUS_LABELS } from "../../utils/constants";
import Skeleton from "../../components/ui/Skeleton";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chart, setChart] = useState<{ date: string; revenue: number }[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const monthLabel = new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" });
  const chartYearTotal = chart.reduce((sum, row) => sum + row.revenue, 0);

  useEffect(() => {
    AdminService.dashboard()
      .then((res) => {
        setStats(res.data.stats);
        setChart(res.data.revenue_chart);
        setMonthlyTotal(res.data.stats.monthly_payment_total ?? 0);
        setRecent(res.data.recent_orders);
      })
      .finally(() => setLoading(false));
  }, []);

  type Widget = {
    label: string;
    value: string | number;
    sub?: string;
    icon: typeof Package;
    color: string;
  };

  const widgets: Widget[] = stats
    ? [
        { label: "Total Orders", value: stats.total_orders, icon: Package, color: "bg-sky-light text-navy" },
        {
          label: "Daily Payments",
          value: `₱${(stats.daily_payments_total ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          sub: `${stats.daily_payments_count ?? 0} order${(stats.daily_payments_count ?? 0) === 1 ? "" : "s"} today`,
          icon: DollarSign,
          color: "bg-emerald-100 text-emerald-700",
        },
        { label: "Pending Orders", value: stats.pending_orders, icon: Clock, color: "bg-amber-100 text-amber-700" },
        { label: "Delivered", value: stats.delivered_orders, icon: CheckCircle, color: "bg-violet-100 text-violet-700" },
      ]
    : [];

  if (loading) return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy dark:text-white">Dashboard Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w, i) => (
          <motion.div key={w.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 card-shadow border border-border dark:border-slate-700">
            <div className={`w-10 h-10 rounded-xl ${w.color} flex items-center justify-center mb-3`}>
              <w.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{w.value}</p>
            <p className="text-sm text-muted">{w.label}</p>
            {w.sub && <p className="text-xs text-muted mt-0.5">{w.sub}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow border border-border dark:border-slate-700">
          <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold text-navy dark:text-white">Payments Received (Monthly)</h3>
              <p className="text-sm text-muted mt-1">
                Paid amounts from payments · {monthLabel}: ₱{monthlyTotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-lg font-bold text-sky">
              12 mo: ₱{chartYearTotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={56} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} />
              <Tooltip formatter={(v) => [`₱${Number(v).toFixed(2)}`, "Received"]} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ fill: "#38bdf8", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow border border-border dark:border-slate-700">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <motion.div className="space-y-3">
            {recent.map((b) => (
              <div key={b.id} className="flex justify-between items-center py-2 border-b border-border dark:border-slate-700 last:border-0">
                <motion.div>
                  <p className="font-medium text-sm">{b.full_name}</p>
                  <p className="text-xs text-muted">{b.tracking_code}</p>
                </motion.div>
                <span className="text-xs px-2 py-1 bg-sky-light dark:bg-sky/20 text-navy dark:text-sky rounded-full">
                  {STATUS_LABELS[b.status]}
                </span>
              </div>
            ))}
            {!recent.length && <p className="text-muted text-sm">No orders yet</p>}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
