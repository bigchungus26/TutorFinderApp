// ── OfflineBanner ─────────────────────────────────────────────
// Detects navigator.onLine / online/offline events.
// Shows a persistent thin banner when offline.
// Shows a "Back online" toast when connection restores.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => {
      setOffline(false);
      toast.success("Back online", { duration: 3000 });
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-ink text-accent-foreground py-2 px-4"
          role="status"
          aria-live="polite"
        >
          <WifiOff size={14} />
          <span className="text-caption">You're offline — some features may not work.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
