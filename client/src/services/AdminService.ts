import AxiosInstance from "./AxiosInstance";
import type { Booking, BookingStatus, DashboardStats, PaginatedResponse, Payment, Service, User } from "../interfaces/types";

const AdminService = {
  dashboard: () =>
    AxiosInstance.get<{
      stats: DashboardStats;
      revenue_chart: { date: string; revenue: number }[];
      status_breakdown: Record<string, number>;
      recent_orders: Booking[];
    }>("/admin/dashboard"),

  bookings: (params?: { status?: string; search?: string; page?: number; per_page?: number; is_done?: boolean }) =>
    AxiosInstance.get<PaginatedResponse<Booking>>("/admin/bookings", { params }),

  updateBookingStatus: (id: number, status: BookingStatus, delivery_rider?: string) =>
    AxiosInstance.patch<{ booking: Booking }>(`/admin/bookings/${id}/status`, { status, delivery_rider }),

  markDone: (id: number) =>
    AxiosInstance.patch<{ booking: Booking }>(`/admin/bookings/${id}/done`),

  markNotDone: (id: number) =>
    AxiosInstance.patch<{ booking: Booking }>(`/admin/bookings/${id}/not-done`),

  cancelBooking: (id: number) =>
    AxiosInstance.post<{ booking: Booking; message: string }>(`/admin/bookings/${id}/cancel`),

  updateBooking: (id: number, data: Partial<Booking>) =>
    AxiosInstance.put<{ booking: Booking }>(`/admin/bookings/${id}`, data),

  deleteBooking: (id: number) =>
    AxiosInstance.delete(`/admin/bookings/${id}`),

  customers: (params?: { search?: string; page?: number }) =>
    AxiosInstance.get<PaginatedResponse<User & { bookings_count: number }>>("/admin/customers", { params }),

  payments: (params?: { status?: string; search?: string; page?: number }) =>
    AxiosInstance.get<PaginatedResponse<Payment & { booking: Booking }>>("/admin/payments", { params }),

  updatePayment: (id: number, data: { payment_status: string; payment_method?: string }) =>
    AxiosInstance.patch(`/admin/payments/${id}`, data),

  services: () => AxiosInstance.get<{ services: Service[] }>("/admin/services"),
  createService: (data: Partial<Service>) => AxiosInstance.post("/admin/services", data),
  updateService: (id: number, data: Partial<Service>) => AxiosInstance.put(`/admin/services/${id}`, data),
  deleteService: (id: number) => AxiosInstance.delete(`/admin/services/${id}`),

  reports: () => AxiosInstance.get("/admin/reports"),
};

export default AdminService;
