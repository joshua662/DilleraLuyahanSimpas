import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal = ({ open, onCancel, onConfirm }: Props) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm card-shadow"
        >
          <h3 className="text-lg font-bold text-navy dark:text-white mb-2">Sign Out</h3>
          <p className="text-muted text-sm mb-6">Are you sure you want to logout?</p>
          <motion.div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-3 border border-border dark:border-slate-600 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">
              Confirm Logout
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default LogoutConfirmModal;
