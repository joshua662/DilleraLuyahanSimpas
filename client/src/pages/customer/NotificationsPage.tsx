import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";

const NotificationsPage = () => {
  const { notifications, unreadCount, markRead, markAllRead, clearAll, loading } = useNotifications();

  return (
    <div className="py-12 max-w-2xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-sky" /> Notifications
          </h1>
          <p className="text-muted">{unreadCount} unread</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button type="button" onClick={() => void markAllRead()} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear all notification history?")) void clearAll();
              }}
              className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear history
            </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <p className="text-muted text-center py-12">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl card-shadow">
          <Bell className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No notifications yet. Updates will appear here when your order status changes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => { if (!n.is_read) void markRead(n.id); }}
              className={`w-full text-left p-5 rounded-2xl card-shadow border transition ${
                n.is_read
                  ? "bg-white dark:bg-slate-800 border-border dark:border-slate-700"
                  : "bg-sky-light/40 dark:bg-sky/10 border-sky/30"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold">{n.title}</h3>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-sky shrink-0 mt-2" />}
              </div>
              <p className="text-sm text-muted mt-1">{n.message}</p>
              <p className="text-xs text-muted mt-2">{new Date(n.created_at).toLocaleString()}</p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
