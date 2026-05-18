import AxiosInstance from "./AxiosInstance";

export interface SmsLog {
  id: number;
  booking_id: number | null;
  phone_number: string;
  message: string;
  status: string;
  created_at: string;
  booking?: { id: number; booking_number: string; tracking_code: string; status: string };
}

const SmsService = {
  myLogs: () => AxiosInstance.get<{ sms_logs: SmsLog[] }>("/sms-logs"),
};

export default SmsService;
