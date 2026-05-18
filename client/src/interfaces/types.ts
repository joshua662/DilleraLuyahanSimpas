export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "customer";
  created_at?: string;
}

export interface Booking {
  id: number;
  user_id?: number;
  booking_number: string;
  booking_reference?: string;
  full_name: string;
  phone: string;
  address: string;
  pickup_date: string;
  pickup_time: string;
  weight: number;
  notes?: string;
  status: BookingStatus;
  tracking_code: string;
  total_price: number;
  is_done: boolean;
  is_finished?: boolean;
  delivery_rider?: string;
  payment_method?: string;
  latitude?: number;
  longitude?: number;
  can_edit?: boolean;
  can_cancel?: boolean;
  can_delete?: boolean;
  payment?: Payment;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "pickup_scheduled"
  | "picked_up"
  | "washing"
  | "drying"
  | "folding"
  | "out_for_delivery"
  | "delivered"
  | "done"
  | "cancelled";

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_status: "pending" | "paid" | "refunded";
}

export interface AppNotification {
  id: number;
  user_id: number;
  booking_id?: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  is_active: boolean;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  message: string;
  rating: number;
}

export interface DashboardStats {
  total_orders: number;
  daily_revenue: number;
  total_revenue: number;
  pending_orders: number;
  delivered_orders: number;
  total_customers: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
