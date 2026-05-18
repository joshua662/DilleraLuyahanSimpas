import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AdminService from "../../services/AdminService";
import type { DashboardStats } from "../../interfaces/types";
import { STATUS_LABELS } from "../../utils/constants";
import Skeleton from "../../components/ui/Skeleton";

const COLORS = ["#38bdf8", "#0c2d6b", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

const AdminReports = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chart, setChart] = useState<{ date: string; revenue: number }[]>([]);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.reports()
      .then((res) => {
        setStats(res.data.stats);
        setChart(res.data.revenue_chart);
        setBreakdown(res.data.status_breakdown);
      })
      .finally(() => setLoading(false));
  }, []);

  const pieData = Object.entries(breakdown).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
  }));

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy dark:text-white">Reports</h2>
      {stats && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: `₱${stats.total_revenue.toFixed(0)}` },
            { label: "Total Orders", value: stats.total_orders },
            { label: "Total Customers", value: stats.total_customers },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 card-shadow border border-border dark:border-slate-700">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow border border-border dark:border-slate-700">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chart}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`₱${v}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#0c2d6b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow border border-border dark:border-slate-700">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
