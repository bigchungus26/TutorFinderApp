// ============================================================
// EntryGatePage — Part 2.6
// Root "/" route for logged-out users.
// Two large tappable cards: student + tutor.
// If user already has a stored role, skip directly.
// ============================================================
import { motion } from "framer-motion";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { getSelectedRole, getRoleLandingPath, setSelectedRole } from "@/lib/rolePreference";
import { variants, springs } from "@/lib/motion";

const EntryGatePage = () => {
  const navigate = useNavigate();
  const storedRole = getSelectedRole();

  if (storedRole) {
    return <Navigate to={getRoleLandingPath(storedRole)} replace />;
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden px-5 py-8"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Noise overlay */}
      <div className="noise-bg" aria-hidden="true" />

      {/* Ambient blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 500, top: "-20%", right: "-20%",
          background: "radial-gradient(circle, rgba(43,166,106,0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400, height: 400, bottom: "-15%", left: "-15%",
          background: "radial-gradient(circle, rgba(245,158,11,0.11) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ scale: [1, 0.92, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      {/* Wordmark */}
      <motion.div
        variants={variants.fadeIn}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center shrink-0 mb-5"
      >
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--accent)",
          }}
        >
          tutr
        </span>
      </motion.div>

      {/* Two role cards */}
      <motion.div
        variants={variants.staggerChildren}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 flex flex-col gap-4 min-h-0"
      >
        {/* Student */}
        <motion.button
          variants={variants.fadeSlideUp}
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          onClick={() => { setSelectedRole("student"); navigate("/signup"); }}
          className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-0 border border-border"
          style={{
            background: "linear-gradient(160deg, rgba(43,166,106,0.12) 0%, rgba(43,166,106,0.05) 100%)",
            boxShadow: "0 4px 24px rgba(43,166,106,0.1)",
          }}
          aria-label="I'm a student — find tutors"
        >
          <span style={{ fontSize: "2.5rem" }} aria-hidden="true">🎓</span>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(1.75rem, 7vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            I'm a student
          </span>
          <span className="text-body-sm text-ink-muted">Find tutors for your courses</span>
        </motion.button>

        {/* Tutor */}
        <motion.button
          variants={variants.fadeSlideUp}
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          onClick={() => { setSelectedRole("tutor"); navigate("/signup"); }}
          className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-0 border border-border"
          style={{
            background: "linear-gradient(160deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)",
            boxShadow: "0 4px 24px rgba(245,158,11,0.1)",
          }}
          aria-label="I'm a tutor — teach students"
        >
          <span style={{ fontSize: "2.5rem" }} aria-hidden="true">✏️</span>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(1.75rem, 7vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            I'm a tutor
          </span>
          <span className="text-body-sm text-ink-muted">Teach students at your campus</span>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <div
        className="relative z-10 shrink-0 flex items-center justify-center gap-4 mt-4"
        style={{
          color: "var(--text-tertiary)",
          fontSize: "0.75rem",
          paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Link to="/login"   className="hover:text-accent transition-colors">Sign in</Link>
        <span aria-hidden="true">·</span>
        <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
        <span aria-hidden="true">·</span>
        <Link to="/terms"   className="hover:text-accent transition-colors">Terms</Link>
      </div>
    </div>
  );
};

export default EntryGatePage;
