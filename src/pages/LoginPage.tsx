import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";

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
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent-soft opacity-60 blur-3xl -translate-y-1/3 translate-x-1/3" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-sm font-body font-semibold text-accent tracking-wide uppercase">Tutr</span>
        </div>
        <h1 className="text-display-lg mb-2">Welcome back.</h1>
        <p className="text-muted-ink text-base mb-8">Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
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
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full p-3.5 rounded-lg border border-hairline bg-surface font-body text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base disabled:opacity-40"
          >
            {loading ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <Link to="/signup" className="text-sm text-muted-ink underline underline-offset-2">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
