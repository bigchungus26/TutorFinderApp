// ============================================================
// LoginPage — Part 2.5
// Clean form. Inline validation. Error shake. Spring submit.
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { springs, variants } from "@/lib/motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [shakeTick, setShakeTick] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err: any) {
      const msg = err.message?.includes("Invalid login")
        ? "Incorrect email or password. Mind double-checking?"
        : err.message || "Something went wrong — try again.";
      setError(msg);
      setShakeTick(n => n + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-auto px-6 pt-12 pb-8"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Noise */}
      <div className="noise-bg" aria-hidden="true" />

      {/* Ambient blob */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 480, height: 480,
          top: "-25%", right: "-20%",
          background: "radial-gradient(circle, rgba(43,166,106,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />

      {/* Back button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        transition={springs.snappy}
        onClick={() => navigate("/")}
        className="relative z-10 inline-flex items-center gap-2 text-body-sm text-ink-muted mb-8 self-start"
        aria-label="Go back"
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>

      {/* Form */}
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
          tutr
        </span>
        <h1 className="text-h1 mb-1">Welcome back.</h1>
        <p className="text-body text-ink-muted mb-8">Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-caption text-ink-muted font-medium mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              autoComplete="email"
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-caption text-ink-muted font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ fontSize: "16px" }}
                className="w-full px-4 py-3.5 pr-12 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-subtle outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-foreground transition-colors p-1 min-h-0 min-w-0"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
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

          {/* Submit */}
          <motion.button
            whileTap={{ scale: loading ? 1 : 0.97 }}
            transition={springs.snappy}
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl text-white font-semibold text-body disabled:opacity-50 flex items-center justify-center"
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
                aria-label="Signing in"
              />
            ) : "Sign in"}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-body-sm text-ink-muted">
          No account?{" "}
          <Link to="/signup" className="text-accent font-semibold underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
