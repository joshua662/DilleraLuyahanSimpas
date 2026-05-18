import { createContext, useCallback, useContext, useState, type FC, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const icons = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-200",
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200",
    info: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/30 dark:border-sky-700 dark:text-sky-200",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <motion.div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border card-shadow ${colors[toast.type]}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}>
                  <X className="w-4 h-4 opacity-60" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
