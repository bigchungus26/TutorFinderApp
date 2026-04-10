// ============================================================
// Teachme — SplashPage
// Handles app-boot resolution: checks network, session, profile,
// then navigates to the correct destination.
// Displays minimum 900ms, maximum 2500ms.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { resolveDestination } from "@/lib/routing";
import { variants, transitions } from "@/lib/motion";

// Exit animation: subtle scale + opacity fade (220ms)
const exitVariants = {
  visible: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: { duration: 0.22, ease: [0.2, 0, 0, 1] },
  },
};

const MINIMUM_MS = 900;
const MAXIMUM_MS = 2500;

const SplashPage = () => {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const destinationRef = useRef<string>("/welcome");
  const resolvedRef = useRef(false);

  useEffect(() => {
    const startTime = Date.now();

    // Hard timeout: always navigate after 2.5s regardless of async state
    const hardTimeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        triggerExit(destinationRef.current);
      }
    }, MAXIMUM_MS);

    const doResolve = async () => {
      // Run checks in parallel
      const [sessionResult] = await Promise.all([
        supabase.auth.getSession(),
        // navigator.onLine is sync; include as resolved promise for parallelism symmetry
        Promise.resolve(navigator.onLine),
      ]);

      const online = navigator.onLine;
      const user = sessionResult.data?.session?.user ?? null;

      // Fetch profile if user is authenticated
      let profile: any = null;
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        profile = data ?? null;
      }

      // Check sessionStorage for a pending deep-link
      const pendingRoute = sessionStorage.getItem("pendingRoute") ?? undefined;

      const destination = resolveDestination({
        user,
        profile,
        online,
        deepLink: pendingRoute,
      });

      // Clear pending route now that we've consumed it
      if (pendingRoute) {
        sessionStorage.removeItem("pendingRoute");
      }

      destinationRef.current = destination;

      // Enforce minimum display time
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
      // On any error, fall back to welcome
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
    // Navigate after exit animation completes (220ms)
    setTimeout(() => {
      navigate(destination, { replace: true });
    }, 240);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial="visible"
          animate="visible"
          exit="exit"
          variants={exitVariants}
          className="min-h-screen bg-background flex flex-col items-center justify-center"
        >
          {/* Wordmark */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={variants.fadeSlideUp}
            className="text-display-xl text-ink select-none"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Teachme
          </motion.h1>

          {/* Pulsing accent dots */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { delayChildren: 0.35, staggerChildren: 0.04 },
              },
            }}
            className="flex items-center gap-1.5 mt-6"
          >
            {[0, 150, 300].map((delay, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0.6 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { ...transitions.standard, delay: delay / 1000 },
                  },
                }}
                className="block w-2 h-2 rounded-full bg-accent"
                style={{
                  animation: `bounce 1s ease-in-out ${delay}ms infinite`,
                }}
              />
            ))}
          </motion.div>

          {/* Inject bounce keyframes inline so they work without a custom Tailwind plugin */}
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashPage;
