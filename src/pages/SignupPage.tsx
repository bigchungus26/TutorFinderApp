import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) return;
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      // If Supabase has email confirmation disabled, the auth state
      // change will auto-redirect via the route guard.
      // If enabled, show a "check your email" message.
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
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent-soft opacity-60 blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-20 left-0 w-48 h-48 rounded-full bg-accent-soft opacity-40 blur-3xl -translate-x-1/3" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-sm font-body font-semibold text-accent tracking-wide uppercase">Tutr</span>
        </div>
        <h1 className="font-display text-[28px] leading-tight font-medium mb-2">Create your account.</h1>
        <p className="text-muted-ink text-base mb-8">Join the peer tutoring community.</p>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div>
            <label className="text-sm font-medium text-muted-ink mb-1.5 block">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full p-3.5 rounded-lg border border-hairline bg-surface font-body text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-ink mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
              className="w-full p-3.5 rounded-lg border border-hairline bg-surface font-body text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-ink mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full p-3.5 rounded-lg border border-hairline bg-surface font-body text-sm"
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
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !agreedTerms}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base disabled:opacity-40"
          >
            {loading ? "Creating account…" : "Create account"}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-muted-ink underline underline-offset-2">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;
