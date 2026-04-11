import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSelectedRole, setSelectedRole } from "@/lib/rolePreference";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [role, setRole] = useState<"student" | "tutor">(() => getSelectedRole() ?? "student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    setSelectedRole(role);
  }, [role]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedTerms) return;
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);
      setCheckEmail(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="mb-6 w-full max-w-sm">
          <button
            type="button"
            onClick={() => setCheckEmail(false)}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink shadow-[0_10px_25px_rgba(26,26,26,0.04)] transition-all hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
        <div className="w-20 h-20 rounded-full bg-accent-soft mb-6 flex items-center justify-center">
          <span className="text-3xl">✉️</span>
        </div>
        <h1 className="font-display text-2xl font-medium mb-2 text-center">Check your email</h1>
        <p className="text-muted-ink text-center mb-6">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <button onClick={() => navigate("/login")} className="text-sm text-accent underline underline-offset-2">
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "auto" }}
      className="px-6 pt-12 pb-8 bg-background"
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-ink-muted mb-8 self-start"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <span
          className="block mb-3"
          style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 500, color: "hsl(var(--accent))" }}
        >
          Tutr
        </span>
        <h1 className="text-display-lg mb-1">Create account.</h1>
        <p className="text-ink-muted mb-6">Join Lebanon's campus tutor network.</p>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          style={{ background: role === "tutor" ? "hsl(35 65% 86%)" : "hsl(152 42% 85%)", color: role === "tutor" ? "hsl(35 50% 20%)" : "hsl(152 40% 18%)" }}
        >
          {role === "tutor" ? "Joining as a tutor" : "Joining as a student"}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="underline underline-offset-2 text-xs opacity-70 ml-1"
          >
            change
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-muted mb-1.5 block">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-4 py-3.5 rounded-xl border border-hairline bg-surface text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-muted mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              className="w-full px-4 py-3.5 rounded-xl border border-hairline bg-surface text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-muted mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full px-4 py-3.5 rounded-xl border border-hairline bg-surface text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={e => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-accent rounded"
            />
            <span className="text-xs text-muted-ink leading-relaxed">
              I agree to the{" "}
              <Link to="/terms" className="text-accent underline" target="_blank">Terms of Use</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-accent underline" target="_blank">Privacy Policy</Link>.
            </span>
          </label>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 12px 36px -4px hsl(158 72% 36% / 0.4)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            type="submit"
            disabled={loading || !agreedTerms}
            className="w-full h-14 rounded-2xl bg-accent text-accent-foreground font-semibold text-base disabled:opacity-40"
          >
            {loading ? "Creating account…" : role === "tutor" ? "Join as a tutor" : "Start learning"}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-ink-muted">
          Have an account?{" "}
          <Link to="/login" className="text-accent font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
