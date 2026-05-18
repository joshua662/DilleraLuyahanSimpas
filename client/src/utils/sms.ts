import { BUSINESS, buildSmsLink } from "./constants";

export const sendSmsToShop = (message?: string) => {
  const defaultMsg = `Hi ${BUSINESS.name}! I need help with my laundry order.`;
  window.location.href = buildSmsLink(BUSINESS.phoneSms, message || defaultMsg);
};

export const sendBookingSms = (bookingNumber: string, trackingCode: string) => {
  const msg = `Hi ${BUSINESS.name}! Booking: ${bookingNumber}\nTracking: ${trackingCode}\nPlease confirm my pickup.`;
  window.location.href = buildSmsLink(BUSINESS.phoneSms, msg);
};
