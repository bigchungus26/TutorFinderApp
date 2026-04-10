import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronUp } from "lucide-react";

type Role = "student" | "tutor";
type AuthMode = "signin" | "signup";

// Panel background tones
const STUDENT_BG = "hsl(152 42% 88%)";
const TUTOR_BG   = "hsl(35 65% 88%)";

// Accent colors per role
const STUDENT_ACCENT = "hsl(152 60% 42%)";
const TUTOR_ACCENT   = "hsl(35 75% 44%)";

const spring = { type: "spring" as const, stiffness: 320, damping: 32 };

const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();

  const initialRole: Role = searchParams.get("intent") === "tutor" ? "tutor" : "student";
  const initialMode: AuthMode = searchParams.get("mode") === "signin" ? "signin" : "signup";

  const [role, setRole] = useState<Role>(initialRole);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const switchRole = (r: Role) => {
    if (r === role) return;
    setRole(r);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, fullName);
        setCheckEmail(true);
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="h-[100dvh] bg-background flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-accent-soft mb-6 flex items-center justify-center">
          <span className="text-3xl">✉️</span>
        </div>
        <h1 className="font-display text-2xl font-medium mb-2 text-center">Check your email</h1>
        <p className="text-ink-muted text-center mb-6 text-sm">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <button onClick={() => navigate("/")} className="text-sm text-accent underline underline-offset-2">
          Go to sign in
        </button>
      </div>
    );
  }

  const accent = role === "student" ? STUDENT_ACCENT : TUTOR_ACCENT;

  // Shared form rendered inside whichever panel is expanded
  const PanelForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {mode === "signup" && (
        <div>
          <label className="text-xs font-medium text-ink-muted mb-1 block">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your full name"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-white/80 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-ink-muted mb-1 block">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@university.edu"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-white/80 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-muted mb-1 block">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
          required
          minLength={8}
          className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-white/80 font-body text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>
      {mode === "signup" && (
        <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={e => setAgreedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 shrink-0 rounded"
          />
          <span className="text-xs text-ink-muted leading-relaxed">
            I agree to the{" "}
            <Link to="/terms" className="underline" target="_blank">Terms</Link>
            {" "}and{" "}
            <Link to="/privacy" className="underline" target="_blank">Privacy Policy</Link>.
          </span>
        </label>
      )}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading || (mode === "signup" && !agreedTerms)}
        className="w-full rounded-xl font-body font-semibold text-sm text-white disabled:opacity-40 mt-1"
        style={{ background: accent, height: "3rem" }}
      >
        {loading
          ? (mode === "signup" ? "Creating…" : "Signing in…")
          : (mode === "signup" ? "Create account" : "Sign in")}
      </motion.button>
    </form>
  );

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Student panel (top) ─────────────────────────────────── */}
      <motion.section
        animate={{ flex: role === "student" ? 7 : 3 }}
        transition={spring}
        className="relative overflow-hidden flex flex-col min-h-0"
        style={{ background: STUDENT_BG }}
      >
        {role === "student" ? (
          /* Expanded */
          <div className="flex-1 flex flex-col px-6 pb-5 overflow-hidden min-h-0"
            style={{ paddingTop: "max(2rem, env(safe-area-inset-top))" }}
          >
            <Link
              to="/welcome"
              className="text-sm text-ink-muted mb-4 block w-fit"
            >
              ← Back
            </Link>

            <p className="text-overline mb-0.5" style={{ color: STUDENT_ACCENT }}>Student</p>
            <h1 className="text-display-md text-ink mb-4">
              {mode === "signin" ? "Welcome back." : "Join as a student."}
            </h1>

            {/* Sign in / Sign up toggle */}
            <div className="flex gap-1 bg-white/60 rounded-xl p-1 mb-4">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
                  mode === "signin"
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted"
                }`}
              >
                Sign up
              </button>
            </div>

            <PanelForm />
          </div>
        ) : (
          /* Collapsed — tap to switch to student */
          <div className="flex-1 flex items-center justify-center px-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => switchRole("student")}
              className="flex items-center gap-3 bg-white/60 border border-white/80 rounded-2xl px-6 py-3.5 shadow-sm w-full max-w-xs justify-center"
            >
              <span className="text-sm font-semibold text-ink">I'm a student</span>
              <ChevronUp size={15} className="text-ink-muted" style={{ transform: "rotate(180deg)" }} />
            </motion.button>
          </div>
        )}
      </motion.section>

      {/* Divider */}
      <div className="h-px shrink-0" style={{ background: "hsl(0 0% 88%)" }} />

      {/* ── Tutor panel (bottom) ────────────────────────────────── */}
      <motion.section
        animate={{ flex: role === "tutor" ? 7 : 3 }}
        transition={spring}
        className="relative overflow-hidden flex flex-col min-h-0"
        style={{ background: TUTOR_BG }}
      >
        {role === "tutor" ? (
          /* Expanded */
          <div className="flex-1 flex flex-col px-6 pt-6 overflow-hidden min-h-0"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <p className="text-overline mb-0.5" style={{ color: TUTOR_ACCENT }}>Tutor</p>
            <h1 className="text-display-md text-ink mb-4">
              {mode === "signin" ? "Welcome back." : "Join as a tutor."}
            </h1>

            {/* Sign in / Sign up toggle */}
            <div className="flex gap-1 bg-white/60 rounded-xl p-1 mb-4">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
                  mode === "signin"
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted"
                }`}
              >
                Sign up
              </button>
            </div>

            <PanelForm />
          </div>
        ) : (
          /* Collapsed — tap to switch to tutor */
          <div className="flex-1 flex items-center justify-center px-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => switchRole("tutor")}
              className="flex items-center gap-3 bg-white/60 border border-white/80 rounded-2xl px-6 py-3.5 shadow-sm w-full max-w-xs justify-center"
            >
              <ChevronUp size={15} className="text-ink-muted" />
              <span className="text-sm font-semibold text-ink">I'm a tutor</span>
            </motion.button>
          </div>
        )}
      </motion.section>

    </div>
  );
};

export default SignupPage;
