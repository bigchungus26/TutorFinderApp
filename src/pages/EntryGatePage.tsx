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
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          onClick={() => { setSelectedRole("student"); navigate("/signup"); }}
          className="flex-1 rounded-[2rem] flex flex-col items-center justify-center gap-3 min-h-0"
          style={{ background: "linear-gradient(160deg, hsl(152 55% 82%) 0%, hsl(158 60% 70%) 100%)", boxShadow: "0 8px 32px hsl(152 55% 60% / 0.3)" }}
        >
          <span style={{ fontSize: "2.5rem" }}>🎓</span>
          <span
            style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.75rem, 7vw, 2.5rem)", fontWeight: 500, color: "hsl(152 50% 14%)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            I'm a student
          </span>
          <span className="text-sm font-medium" style={{ color: "hsl(152 40% 28%)" }}>Find tutors for your courses</span>
        </motion.button>

        {/* Tutor */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          onClick={() => { setSelectedRole("tutor"); navigate("/signup"); }}
          className="flex-1 rounded-[2rem] flex flex-col items-center justify-center gap-3 min-h-0"
          style={{ background: "linear-gradient(160deg, hsl(35 80% 84%) 0%, hsl(30 75% 72%) 100%)", boxShadow: "0 8px 32px hsl(35 70% 60% / 0.3)" }}
        >
          <span style={{ fontSize: "2.5rem" }}>✏️</span>
          <span
            style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.75rem, 7vw, 2.5rem)", fontWeight: 500, color: "hsl(35 60% 16%)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            I'm a tutor
          </span>
          <span className="text-sm font-medium" style={{ color: "hsl(35 45% 30%)" }}>Teach students at your campus</span>
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
