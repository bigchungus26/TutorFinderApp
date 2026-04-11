import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
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
        <h1 className="text-display-lg mb-1">Welcome back.</h1>
        <p className="text-ink-muted mb-8">Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-3.5 rounded-xl border border-hairline bg-surface text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl text-white font-semibold text-base disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, hsl(158 76% 44%), hsl(165 80% 30%))", boxShadow: "0 8px 24px hsl(158 76% 40% / 0.35)" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-ink-muted">
          No account?{" "}
          <Link to="/signup" className="text-accent font-medium underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
