// ============================================================
// SplashPage — Part 2.3
// Full cream background with noise. Two ambient blobs drifting.
// Center: Fraunces "tutr" 72px weight 800 in accent color.
// Tagline fadeSlideUp with 400ms delay.
// Auto-routes after 1400ms. Tap to skip.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { resolveDestination } from "@/lib/routing";
import { springs } from "@/lib/motion";

const MINIMUM_MS = 900;
const MAXIMUM_MS = 2000;

const SplashPage = () => {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const destinationRef = useRef<string>("/welcome");
  const resolvedRef = useRef(false);
  const [taglineVisible, setTaglineVisible] = useState(false);

  useEffect(() => {
    const taglineTimer = setTimeout(() => setTaglineVisible(true), 400);
    return () => clearTimeout(taglineTimer);
  }, []);

  useEffect(() => {
    const startTime = Date.now();

    const hardTimeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        triggerExit(destinationRef.current);
      }
    }, MAXIMUM_MS);

    const doResolve = async () => {
      const [sessionResult] = await Promise.all([
        supabase.auth.getSession(),
        Promise.resolve(navigator.onLine),
      ]);

      const online = navigator.onLine;
      const user = sessionResult.data?.session?.user ?? null;

      let profile: any = null;
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        profile = data ?? null;
      }

      const pendingRoute = sessionStorage.getItem("pendingRoute") ?? undefined;
      const destination = resolveDestination({ user, profile, online, deepLink: pendingRoute });
      if (pendingRoute) sessionStorage.removeItem("pendingRoute");

      destinationRef.current = destination;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MINIMUM_MS - elapsed);
      await new Promise<void>((resolve) => setTimeout(resolve, remaining));

      if (!resolvedRef.current) {
        resolvedRef.current = true;
        clearTimeout(hardTimeout);
        triggerExit(destination);
      }
    };

    doResolve().catch(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        clearTimeout(hardTimeout);
        triggerExit("/welcome");
      }
    });

    return () => clearTimeout(hardTimeout);
  }, []);

  const triggerExit = (destination: string) => {
    setExiting(true);
    setTimeout(() => navigate(destination, { replace: true }), 250);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.25 } }}
          className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{ background: "var(--bg-primary)" }}
          onClick={() => {
            if (!resolvedRef.current) {
              resolvedRef.current = true;
              triggerExit(destinationRef.current);
            }
          }}
        >
          {/* Noise texture */}
          <div className="noise-bg" aria-hidden="true" />

          {/* Ambient blob 1 — top-left, green */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 500,
              height: 500,
              left: "-15%",
              top: "-15%",
              background: "radial-gradient(circle, rgba(43,166,106,0.18) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{
              x: [0, 30, -15, 0],
              y: [0, -20, 25, 0],
              scale: [1, 1.08, 0.96, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Ambient blob 2 — bottom-right, warm */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 420,
              height: 420,
              right: "-12%",
              bottom: "-12%",
              background: "radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{
              x: [0, -25, 15, 0],
              y: [0, 20, -30, 0],
              scale: [1, 0.92, 1.06, 1],
            }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Wordmark */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springs.gentle}
              className="select-none"
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "4.5rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: "var(--accent)",
              }}
            >
              TUTR
            </motion.h1>

            {/* Tagline */}
            <AnimatePresence>
              {taglineVisible && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-body text-ink-muted mt-3 text-center"
                >
                  Peer tutoring for Lebanese universities
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashPage;
