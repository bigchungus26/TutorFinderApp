// ============================================================
// EntryGatePage — Part 2.6
// Root "/" route for logged-out users.
// Two large tappable cards: student + tutor.
// If user already has a stored role, skip directly.
// ============================================================
import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useNavigate, Navigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSelectedRole, getRoleLandingPath, isSelectedRole, setSelectedRole } from "@/lib/rolePreference";
import { toast } from "@/components/ui/sonner";
import { variants, springs } from "@/lib/motion";
import { useTheme } from "@/hooks/useTheme";

const EntryGatePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [isStartingFlow, setIsStartingFlow] = useState(false);
  const storedRole = getSelectedRole();
  const isSwitchMode = searchParams.get("switch") === "1";
  const roleFromQuery = searchParams.get("role");
  const activeRole = isSelectedRole(roleFromQuery) ? roleFromQuery : storedRole;
  const isDarkMode =
    theme === "dark" ||
    (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const studentCardStyle = isDarkMode
    ? {
        background:
          "linear-gradient(160deg, rgba(43,166,106,0.28) 0%, rgba(43,166,106,0.16) 100%)",
        boxShadow: "0 10px 30px rgba(7,18,13,0.32), 0 0 0 1px rgba(92,214,154,0.12) inset",
      }
    : {
        background:
          "linear-gradient(160deg, rgba(43,166,106,0.31) 0%, rgba(43,166,106,0.18) 100%)",
        boxShadow: "0 18px 42px rgba(43,166,106,0.16), 0 0 0 1px rgba(43,166,106,0.14) inset",
      };
  const tutorCardStyle = isDarkMode
    ? {
        background:
          "linear-gradient(160deg, rgba(245,158,11,0.24) 0%, rgba(245,158,11,0.14) 100%)",
        boxShadow: "0 10px 30px rgba(20,14,5,0.32), 0 0 0 1px rgba(255,214,153,0.12) inset",
      }
    : {
        background:
          "linear-gradient(160deg, rgba(245,158,11,0.29) 0%, rgba(245,158,11,0.17) 100%)",
        boxShadow: "0 18px 42px rgba(245,158,11,0.16), 0 0 0 1px rgba(245,158,11,0.14) inset",
      };

  if (!isSwitchMode && activeRole && !isStartingFlow) {
    return <Navigate to={getRoleLandingPath(activeRole)} replace />;
  }

  const handleRoleSelect = async (role: "student" | "tutor") => {
    setIsStartingFlow(true);
    setSelectedRole(role);

    if (user && !profile?.onboarded_at) {
      try {
        await signOut();
      } catch (error) {
        setIsStartingFlow(false);
        toast("We couldn't reset your current session. Please try again.");
        return;
      }
    }

    navigate(`/signup?role=${role}`, { replace: true });
  };

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

      <motion.div
        variants={variants.fadeIn}
        initial="hidden"
        animate="visible"
        className="relative z-10 mb-5 flex items-center justify-between gap-3 shrink-0"
      >
        <div className="w-[90px]" />
        <span
          className="text-center"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--accent)",
          }}
        >
          TUTR
        </span>
        <div className="flex items-center rounded-full border border-border bg-surface/90 p-1 shadow-sm backdrop-blur-sm">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
          ].map(({ value, label, icon: Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-label={`Switch to ${label.toLowerCase()} mode`}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-accent text-white" : "text-ink-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
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
          onClick={() => void handleRoleSelect("student")}
          disabled={isStartingFlow}
          className={`flex-1 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-0 border transition-colors ${
            isDarkMode ? "border-white/10" : "border-[#acd0bc]"
          }`}
          style={studentCardStyle}
          aria-label="I'm a student — find tutors"
        >
          <span style={{ fontSize: "2.5rem" }} aria-hidden="true">🎓</span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
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
          onClick={() => void handleRoleSelect("tutor")}
          disabled={isStartingFlow}
          className={`flex-1 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-0 border transition-colors ${
            isDarkMode ? "border-white/10" : "border-[#dfc58f]"
          }`}
          style={tutorCardStyle}
          aria-label="I'm a tutor — teach students"
        >
          <span style={{ fontSize: "2.5rem" }} aria-hidden="true">✏️</span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
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
