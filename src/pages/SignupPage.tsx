// ============================================================
// SignupPage — Part 2.5
// Role pill, floating labels, inline validation, spring submit.
// ============================================================
import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { clearSelectedRole, getSelectedRole, isSelectedRole, setSelectedRole } from "@/lib/rolePreference";
import { supabase } from "@/lib/supabase";
import { springs, variants } from "@/lib/motion";

const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();
  const requestedRole = searchParams.get("role");
  const initialRole = isSelectedRole(requestedRole) ? requestedRole : getSelectedRole() ?? "student";
  const [role, setRole]         = useState<"student" | "tutor">(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [shakeTick, setShakeTick]   = useState(0);

  useEffect(() => {
    if (isSelectedRole(requestedRole) && requestedRole !== role) {
      setRole(requestedRole);
      return;
    }
    setSelectedRole(role);
  }, [requestedRole, role]);

  const handleBackToRolePicker = () => {
    clearSelectedRole();
    navigate("/");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) return;
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ role, full_name: fullName })
          .eq("id", user.id);
      }

      setCheckEmail(true);
    } catch (err: any) {
      const msg = err.message?.includes("already registered")
        ? "That email is already registered. Try signing in instead."
        : err.message || "Something went wrong — try again.";
      setError(msg);
      setShakeTick(n => n + 1);
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center px-6 bg-background">
        <div className="noise-bg" aria-hidden="true" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-accent-light mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl" aria-hidden="true">✉️</span>
          </div>
          <h1 className="text-h1 mb-2">Check your email</h1>
          <p className="text-body text-ink-muted mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <button onClick={() => navigate(`/login?role=${role}`)} className="text-body-sm text-accent underline underline-offset-2">
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  const roleColor = role === "tutor" ? "rgba(245,158,11,0.12)" : "rgba(43,166,106,0.12)";
  const roleTextColor = role === "tutor" ? "#92400e" : "#065f46";

  return (
    <div className="fixed inset-0 flex flex-col overflow-auto px-6 pt-12 pb-8 bg-background">
      <div className="noise-bg" aria-hidden="true" />

      {/* Back */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        transition={springs.snappy}
        onClick={handleBackToRolePicker}
        className="relative z-10 inline-flex items-center gap-2 text-body-sm text-ink-muted mb-8 self-start"
        aria-label="Go back"
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>

      <motion.div
        variants={variants.fadeSlideUp}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 flex flex-col justify-center max-w-sm w-full mx-auto"
      >
        <span
          className="block mb-3"
          style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 700, color: "var(--accent)" }}
        >
          TUTR
        </span>
        <h1 className="text-h1 mb-1">Create account.</h1>
        <p className="text-body text-ink-muted mb-5">Join Lebanon's campus tutor network.</p>

        {/* Role pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-body-sm font-medium mb-6 self-start"
          style={{ background: roleColor, color: roleTextColor }}
        >
          {role === "tutor" ? "Joining as a tutor ✏️" : "Joining as a student 🎓"}
          <button
            type="button"
            onClick={handleBackToRolePicker}
            className="underline underline-offset-2 text-caption opacity-70 ml-1 min-h-0 min-w-0"
          >
            change
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-caption text-ink-muted font-medium mb-1.5">Full name</label>
            <input
              id="name" type="text" value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name" required autoComplete="name"
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-caption text-ink-muted font-medium mb-1.5">Email</label>
            <input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu" required autoComplete="email"
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-caption text-ink-muted font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password" type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters" required minLength={8} autoComplete="new-password"
                style={{ fontSize: "16px" }}
                className="w-full px-4 py-3.5 pr-12 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted p-1 min-h-0 min-w-0">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-accent" />
            <span className="text-caption text-ink-muted leading-relaxed">
              I agree to the{" "}
              <Link to="/terms" className="text-accent underline" target="_blank" rel="noopener">Terms</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-accent underline" target="_blank" rel="noopener">Privacy Policy</Link>.
            </span>
          </label>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key={shakeTick}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: [0, -5, 5, -5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-body-sm text-error rounded-xl px-4 py-3"
                style={{ background: "rgba(239,68,68,0.08)" }}
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: loading || !agreed ? 1 : 0.97 }}
            transition={springs.snappy}
            type="submit"
            disabled={loading || !agreed}
            className="w-full h-14 rounded-xl text-white font-semibold text-body disabled:opacity-40 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              boxShadow: "0 8px 24px rgba(43,166,106,0.3)",
            }}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              role === "tutor" ? "Join as a tutor" : "Start learning"
            )}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-body-sm text-ink-muted">
          Have an account?{" "}
          <Link to={`/login?role=${role}`} className="text-accent font-semibold underline underline-offset-2">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
