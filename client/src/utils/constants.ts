export const BUSINESS = {
  name: "MD & V Laundry Shop",
  phone: "0969 150 3988",
  phoneLink: "tel:+639691503988",
  phoneSms: "+639691503988",
  facebook: "https://facebook.com/",
  hours: "Monday – Sunday, 8AM – 7PM",
  address: "1408 Mansion Rd, Roxas City, Western Visayas",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.5!2d122.7511!3d11.5883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a0182e8b8b8b8b%3A0x0!2s1408%20Mansion%20Rd%2C%20Roxas%20City%2C%20Capiz!5e0!3m2!1sen!2sph!4v1",
  coordinates: { lat: 11.5883, lng: 122.7511 },
};

export const BOOKING_STATUSES = [
  { key: "pending", label: "Pending", step: 0, color: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200" },
  { key: "confirmed", label: "Confirmed", step: 1, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" },
  { key: "pickup_scheduled", label: "Pickup Scheduled", step: 2, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200" },
  { key: "washing", label: "Washing", step: 3, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200" },
  { key: "drying", label: "Drying", step: 4, color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200" },
  { key: "folding", label: "Folding", step: 5, color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200" },
  { key: "out_for_delivery", label: "Out for Delivery", step: 6, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" },
  { key: "done", label: "Finished", step: 7, color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200" },
] as const;

export const TERMINAL_STATUSES = ["done", "delivered", "cancelled"];

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  pickup_scheduled: "Pickup Scheduled",
  picked_up: "Picked Up",
  washing: "Washing",
  drying: "Drying",
  folding: "Folding",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  done: "Finished",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  BOOKING_STATUSES.map((s) => [s.key, s.color])
);
STATUS_COLORS.cancelled = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
STATUS_COLORS.picked_up = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200";
STATUS_COLORS.delivered = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";

export const ALL_STATUS_KEYS = [...BOOKING_STATUSES.map((s) => s.key), "cancelled", "picked_up", "delivered"];

/** Admin workflow statuses for order progress updates */
export const ADMIN_WORKFLOW_STATUSES = [
  "pending",
  "washing",
  "drying",
  "folding",
  "out_for_delivery",
  "done",
] as const;

export function getStatusStep(status: string): number {
  if (status === "cancelled") return -1;
  if (status === "done" || status === "delivered") return BOOKING_STATUSES.length;
  const found = BOOKING_STATUSES.find((s) => s.key === status);
  if (found) return found.step;
  if (status === "picked_up") return 2;
  return 0;
}

export function calculatePrice(weight: number): number {
  const baseWeight = 8;
  const basePrice = 99;
  const extraPerKg = 12;
  if (weight <= baseWeight) return basePrice;
  return basePrice + (weight - baseWeight) * extraPerKg;
}

export function buildSmsLink(phone: string, message?: string): string {
  const normalized = phone.replace(/\s/g, "");
  const base = `sms:${normalized}`;
  return message ? `${base}?body=${encodeURIComponent(message)}` : base;
}

export function getEstimatedCompletion(pickupDate: string): string {
  const d = new Date(pickupDate);
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });
}
