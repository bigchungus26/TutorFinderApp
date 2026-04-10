// ============================================================
// Tutr — OfflinePage
// Shown when the device has no network connectivity.
// Auto-retries every 5 seconds; navigates to "/" when online.
// ============================================================

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { variants } from "@/lib/motion";

const RETRY_INTERVAL_MS = 5000;

const OfflinePage = () => {
  const navigate = useNavigate();

  // Poll navigator.onLine every 5 seconds and navigate when restored
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) {
        clearInterval(interval);
        navigate("/", { replace: true });
      }
    }, RETRY_INTERVAL_MS);

    // Also listen to the online event for instant recovery
    const handleOnline = () => {
      clearInterval(interval);
      navigate("/", { replace: true });
    };
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants.fadeSlideUp}
        className="flex flex-col items-center gap-4 max-w-xs w-full"
      >
        {/* Icon */}
        <WifiOff
          size={48}
          strokeWidth={1.5}
          className="text-ink-muted"
          aria-hidden="true"
        />

        {/* Heading */}
        <h1 className="text-display-md text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
          You're offline
        </h1>

        {/* Body */}
        <p className="text-body-sm text-ink-muted">
          Tutr needs a connection to find tutors for you.
        </p>

        {/* Try again button */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="
            mt-2 h-12 w-full max-w-64
            bg-accent text-white
            rounded-xl text-body font-medium
            active:scale-95 transition-transform
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
          "
        >
          Try again
        </button>
      </motion.div>
    </div>
  );
};

export default OfflinePage;
