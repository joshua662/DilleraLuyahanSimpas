import { motion } from "framer-motion";
import { MessageSquare, Phone } from "lucide-react";
import { BUSINESS } from "../../utils/constants";
import { sendSmsToShop } from "../../utils/sms";

const FloatingButtons = () => (
  <motion.div className="fixed bottom-24 md:bottom-8 right-4 z-50 flex flex-col gap-3">
    <motion.button
      type="button"
      onClick={() => sendSmsToShop()}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-sky text-navy shadow-lg font-bold text-xs"
      aria-label="Send SMS"
    >
      <MessageSquare className="w-6 h-6" />
    </motion.button>
    <motion.a
      href={BUSINESS.phoneLink}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1 }}
      whileHover={{ scale: 1.1 }}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-navy text-white shadow-lg"
      aria-label="Call"
    >
      <Phone className="w-6 h-6" />
    </motion.a>
  </motion.div>
);

export default FloatingButtons;
