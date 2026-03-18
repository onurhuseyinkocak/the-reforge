import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationBanner = () => {
  const { showBanner, requestPermission, dismissBanner } = useNotifications();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl mb-4"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

          <div className="flex items-center gap-4 p-4">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
              <Bell className="h-5 w-5 text-amber-400" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">
                Bildirimleri ac
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Gunluk check-in hatirlatmalari ve lonca bildirimlerini kacirma.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={requestPermission}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/20 text-sm font-medium text-amber-400 hover:from-amber-500/30 hover:to-orange-500/25 transition-all duration-200"
              >
                Izin Ver
              </motion.button>
              <button
                onClick={dismissBanner}
                className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBanner;
