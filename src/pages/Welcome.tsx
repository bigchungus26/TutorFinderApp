import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Logged in but not onboarded → show role picker
  if (user) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent-soft opacity-60 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="mb-4">
            <span className="text-sm font-body font-semibold text-accent tracking-wide uppercase">Teachme</span>
          </div>
          <h1 className="font-display text-[32px] leading-tight font-medium mb-3">
            How will you use Teachme?
          </h1>
          <p className="text-muted-ink text-base leading-relaxed mb-12">
            You can switch anytime from your profile.
          </p>

          <div className="space-y-3 flex-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/onboarding/student")}
              className="w-full bg-surface border-2 border-accent rounded-xl p-5 text-left flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="font-display font-medium text-lg mb-0.5">I'm a student</div>
                <div className="text-sm text-muted-ink">Find tutors for your courses</div>
              </div>
              <ChevronRight size={20} className="text-accent" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/onboarding/tutor")}
              className="w-full bg-surface border border-hairline rounded-xl p-5 text-left flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="font-display font-medium text-lg mb-0.5 text-muted-ink">I'm a tutor</div>
                <div className="text-sm text-muted-ink">Share what you've aced and earn</div>
              </div>
              <ChevronRight size={20} className="text-muted-ink" />
            </motion.button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not logged in → show landing
  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent-soft opacity-60 blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-20 left-0 w-48 h-48 rounded-full bg-accent-soft opacity-40 blur-3xl -translate-x-1/3" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-sm font-body font-semibold text-accent tracking-wide uppercase">Teachme</span>
        </div>
        <h1 className="font-display text-[32px] leading-tight font-medium mb-3">
          Learn from students who've been there.
        </h1>
        <p className="text-muted-ink text-base leading-relaxed mb-12">
          Teachme connects you with top peer tutors at your university.
        </p>

        <div className="space-y-3 flex-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/signup")}
            className="w-full bg-surface border-2 border-accent rounded-xl p-5 text-left flex items-center gap-4"
          >
            <div className="flex-1">
              <div className="font-display font-medium text-lg mb-0.5">Get started</div>
              <div className="text-sm text-muted-ink">Create a free account</div>
            </div>
            <ChevronRight size={20} className="text-accent" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login")}
            className="w-full bg-surface border border-hairline rounded-xl p-5 text-left flex items-center gap-4"
          >
            <div className="flex-1">
              <div className="font-display font-medium text-lg mb-0.5 text-muted-ink">Sign in</div>
              <div className="text-sm text-muted-ink">I already have an account</div>
            </div>
            <ChevronRight size={20} className="text-muted-ink" />
          </motion.button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WelcomePage;
