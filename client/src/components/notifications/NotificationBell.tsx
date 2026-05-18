import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";

const NotificationBell = () => {
  const { unreadCount, notifications, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-border dark:border-slate-700 overflow-hidden z-50"
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-slate-700 gap-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2 shrink-0">
                {unreadCount > 0 && (
                  <button type="button" onClick={() => void markAllRead()} className="text-xs text-sky font-medium">
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Clear all notification history?")) void clearAll();
                    }}
                    className="text-xs text-red-600 font-medium hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted">No notifications yet</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!n.is_read) void markRead(n.id);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!n.is_read ? "bg-sky-light/30 dark:bg-sky/5" : ""}`}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center py-3 text-sm text-sky font-medium border-t border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
