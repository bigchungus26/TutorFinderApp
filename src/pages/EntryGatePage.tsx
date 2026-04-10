import { motion } from "framer-motion";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getSelectedRole, getRoleLandingPath, setSelectedRole } from "@/lib/rolePreference";

const EntryGatePage = () => {
  const navigate = useNavigate();
  const storedRole = getSelectedRole();

  if (storedRole) {
    return <Navigate to={getRoleLandingPath(storedRole)} replace />;
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
      className="px-5 py-8"
    >
      {/* Wordmark */}
      <div className="text-center shrink-0 mb-5">
        <span
          className="select-none"
          style={{ fontFamily: "'Fraunces', serif", fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.02em", color: "hsl(var(--ink))" }}
        >
          Tutr
        </span>
      </div>

      {/* Two fat buttons */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">

        {/* Student */}
        <motion.button
          whileHover={{ scale: 1.025, y: -5, boxShadow: "0 24px 48px -8px hsl(152 50% 60% / 0.35)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={() => { setSelectedRole("student"); navigate("/signup"); }}
          className="flex-1 rounded-[2rem] flex flex-col items-center justify-center gap-2 min-h-0"
          style={{ background: "hsl(152 42% 85%)" }}
        >
          <span
            style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem, 8vw, 2.75rem)", fontWeight: 500, color: "hsl(152 40% 18%)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            I'm a student
          </span>
          <span className="text-sm" style={{ color: "hsl(152 30% 35%)" }}>Find tutors for your courses</span>
        </motion.button>

        {/* Tutor */}
        <motion.button
          whileHover={{ scale: 1.025, y: -5, boxShadow: "0 24px 48px -8px hsl(35 70% 55% / 0.35)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={() => { setSelectedRole("tutor"); navigate("/signup"); }}
          className="flex-1 rounded-[2rem] flex flex-col items-center justify-center gap-2 min-h-0"
          style={{ background: "hsl(35 65% 86%)" }}
        >
          <span
            style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem, 8vw, 2.75rem)", fontWeight: 500, color: "hsl(35 50% 20%)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            I'm a tutor
          </span>
          <span className="text-sm" style={{ color: "hsl(35 35% 38%)" }}>Teach students at your campus</span>
        </motion.button>

      </div>

      {/* Footer */}
      <div
        className="shrink-0 flex items-center justify-center gap-3 mt-4"
        style={{ color: "#8a8a8a", fontSize: "0.75rem", paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
      >
        <Link to="/login" className="hover:text-accent transition-colors">Sign in</Link>
        <span aria-hidden="true">·</span>
        <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
        <span aria-hidden="true">·</span>
        <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
      </div>
    </div>
  );
};

export default EntryGatePage;
