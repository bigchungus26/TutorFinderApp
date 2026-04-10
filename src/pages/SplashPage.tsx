import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/welcome"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden"
      onClick={() => navigate("/welcome")}
    >
      <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full bg-accent-soft opacity-50 blur-3xl translate-x-1/3" />
      <div className="absolute bottom-1/4 left-0 w-56 h-56 rounded-full bg-accent-soft opacity-40 blur-3xl -translate-x-1/3" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 className="font-display text-6xl font-semibold text-accent tracking-tight">Tutr</h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-muted-ink text-base mt-3"
        >
          Peer tutoring, simplified.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SplashPage;
