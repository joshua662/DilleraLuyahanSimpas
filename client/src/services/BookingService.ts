import AxiosInstance from "./AxiosInstance";
import type { Booking } from "../interfaces/types";

export interface CreateBookingPayload {
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  pickup_date?: string | null;
  pickup_time?: string | null;
  weight: number;
  notes?: string;
  payment_method?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateBookingPayload extends Partial<CreateBookingPayload> {}

const BookingService = {
  create: (data: CreateBookingPayload) =>
    AxiosInstance.post<{ message: string; booking: Booking; notification?: { sent: boolean; message: string } }>("/bookings", data),
  track: (tracking_code: string) =>
    AxiosInstance.post<{ booking: Booking }>("/bookings/track", { tracking_code }),
  myOrders: () => AxiosInstance.get<{ bookings: Booking[] }>("/my-orders"),
  get: (id: number) => AxiosInstance.get<{ booking: Booking }>(`/bookings/${id}`),
  update: (id: number, data: UpdateBookingPayload) =>
    AxiosInstance.put<{ booking: Booking }>(`/bookings/${id}`, data),
  cancel: (id: number) =>
    AxiosInstance.post<{ booking: Booking }>(`/bookings/${id}/cancel`),
  trash: (id: number) =>
    AxiosInstance.post<{ message: string }>(`/bookings/${id}/trash`),
  myTrash: () =>
    AxiosInstance.get<{ bookings: Booking[] }>("/my-orders/trash"),
  restore: (id: number) =>
    AxiosInstance.post<{ message: string; booking: Booking }>(`/bookings/${id}/restore`),
  forceDelete: (id: number) =>
    AxiosInstance.delete<{ message: string }>(`/bookings/${id}/force`),
};

export default BookingService;
