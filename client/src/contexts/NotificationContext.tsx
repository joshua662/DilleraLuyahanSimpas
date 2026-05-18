import { createContext, useCallback, useContext, useEffect, useRef, useState, type FC, type ReactNode } from "react";
import NotificationService from "../services/NotificationService";
import type { AppNotification } from "../interfaces/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 60_000;

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lastUnread = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userIdRef = useRef(user?.id);

  const refresh = useCallback(async (silent = false) => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        NotificationService.list(),
        NotificationService.unreadCount(),
      ]);
      const raw = listRes.data.notifications as { data?: AppNotification[] } | AppNotification[];
      const items = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const count = countRes.data.unread_count;
      setNotifications(Array.isArray(items) ? items : []);
      setUnreadCount(count);

      if (count > lastUnread.current && lastUnread.current > 0) {
        const latest = items[0];
        if (latest) {
          showToastRef.current(latest.message, "info");
          try {
            audioRef.current?.play();
          } catch { /* ignore */ }
        }
      }
      lastUnread.current = count;
    } catch {
      /* silent */
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id === userIdRef.current) return;
    userIdRef.current = user?.id;
    lastUnread.current = 0;
    void refresh(false);
  }, [user?.id, refresh]);

  useEffect(() => {
    if (!user) return;
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      void refresh(true);
    };
    const id = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [user, refresh]);

  const markRead = async (id: number) => {
    await NotificationService.markRead(id);
    await refresh(true);
  };

  const markAllRead = async () => {
    await NotificationService.markAllRead();
    await refresh(true);
  };

  const clearAll = async () => {
    await NotificationService.clearAll();
    setNotifications([]);
    setUnreadCount(0);
    lastUnread.current = 0;
    await refresh(true);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refresh: () => refresh(true), markRead, markAllRead, clearAll }}>
      <audio ref={audioRef} preload="auto" src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6Wj4qFf3p1c3BqaWdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2VoaGdpZ2Vo" />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
