import { MessageSquare, Phone } from "lucide-react";
import { BUSINESS } from "../../utils/constants";
import { sendSmsToShop } from "../../utils/sms";

const FloatingButtons = () => (
  <div className="hidden md:flex fixed bottom-8 right-4 z-50 flex-col gap-3">
    <button
      type="button"
      onClick={() => sendSmsToShop()}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-sky text-navy shadow-lg font-bold text-xs hover:scale-110 transition-transform"
      aria-label="Send SMS"
    >
      <MessageSquare className="w-6 h-6" />
    </button>
    <a
      href={BUSINESS.phoneLink}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-navy text-white shadow-lg hover:scale-110 transition-transform"
      aria-label="Call"
    >
      <Phone className="w-6 h-6" />
    </a>
  </div>
);

export default FloatingButtons;
