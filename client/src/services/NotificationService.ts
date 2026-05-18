import AxiosInstance from "./AxiosInstance";
import type { AppNotification } from "../interfaces/types";

const NotificationService = {
  list: (page = 1) =>
    AxiosInstance.get<{
      notifications: { data: AppNotification[] };
      unread_count: number;
      meta: { current_page: number; last_page: number; total: number };
    }>("/notifications", { params: { page } }),

  unreadCount: () =>
    AxiosInstance.get<{ unread_count: number }>("/notifications/unread-count"),

  markRead: (id: number) =>
    AxiosInstance.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    AxiosInstance.post("/notifications/read-all"),

  clearAll: () =>
    AxiosInstance.delete<{ message: string }>("/notifications"),
};

export default NotificationService;
