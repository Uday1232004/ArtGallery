import { useToastStore } from '../store/toastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-carbon/95 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden`}
          >
            {/* Status indicator color strip */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' : 'bg-gold'
              }`}
            />

            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 size={16} className="text-green-400" />}
              {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
              {toast.type === 'info' && <Info size={16} className="text-gold" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs text-cream font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-mist/50 hover:text-cream transition-colors mt-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
