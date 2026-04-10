import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { transitions, variants } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  getRoleLandingPath,
  getSelectedRole,
  setSelectedRole,
  type SelectedRole,
} from "@/lib/rolePreference";

const roleCards: Array<{
  role: SelectedRole;
  eyebrow: string;
  title: string;
  description: string;
  accentClass: string;
  icon: typeof BookOpen;
}> = [
  {
    role: "student",
    eyebrow: "Student mode",
    title: "I'm a student",
    description: "Find trusted tutors by university, course, and budget.",
    accentClass: "from-accent-soft via-white to-white",
    icon: BookOpen,
  },
  {
    role: "tutor",
    eyebrow: "Tutor mode",
    title: "I'm a tutor",
    description: "Create your profile, get discovered, and grow your tutoring income.",
    accentClass: "from-secondary/40 via-white to-white",
    icon: GraduationCap,
  },
];

const EntryGatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storedRole = getSelectedRole();
  const isSwitchingRole = searchParams.get("switch") === "1";

  if (storedRole && !isSwitchingRole) {
    return <Navigate to={getRoleLandingPath(storedRole)} replace />;
  }

  const handleRoleSelect = (role: SelectedRole) => {
    setSelectedRole(role);
    navigate(getRoleLandingPath(role));
  };

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,_rgba(47,191,140,0.14),_transparent_62%)]" />
        <div className="absolute left-[-3rem] top-28 h-40 w-40 rounded-full bg-accent-soft/80 blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-48 w-48 rounded-full bg-secondary/25 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
          <header className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles size={16} />
              TutorFinder
            </span>

            <div className="flex items-center gap-3 text-sm">
              <Link to="/login" className="text-ink-muted transition-colors hover:text-primary">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-hairline bg-white px-4 py-2 font-medium text-ink shadow-[0_10px_25px_rgba(26,26,26,0.04)] transition-all hover:border-primary hover:text-primary"
              >
                Sign up
              </Link>
            </div>
          </header>

          <main className="flex flex-1 items-center py-10 sm:py-14">
            <div className="w-full">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={variants.staggerChildren}
                className="mx-auto max-w-3xl text-center"
              >
                <motion.p variants={variants.fadeSlideUp} className="text-overline text-primary">
                  Choose how you want to use the platform
                </motion.p>
                <motion.h1
                  variants={variants.fadeSlideUp}
                  className="mt-4 text-display-hero-lg leading-[1.02] sm:text-[4.5rem]"
                >
                  Find the right academic support.
                </motion.h1>
                <motion.p
                  variants={variants.fadeSlideUp}
                  className="mx-auto mt-5 max-w-2xl text-body-lg leading-relaxed text-ink-muted"
                >
                  Browse as a student or join as a tutor. Start with the experience built for
                  your goal and switch later whenever you need.
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={variants.staggerChildren}
                className="mx-auto mt-10 grid max-w-4xl gap-4 sm:mt-14 md:grid-cols-2"
              >
                {roleCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <motion.button
                      key={card.role}
                      variants={variants.scaleIn}
                      whileHover={{ y: -4, transition: transitions.fast }}
                      whileTap={{ scale: 0.985 }}
                      type="button"
                      onClick={() => handleRoleSelect(card.role)}
                      className="group relative overflow-hidden rounded-[2rem] border border-hairline bg-white text-left shadow-[0_24px_70px_rgba(26,26,26,0.07)] transition-all hover:border-primary/35 hover:shadow-[0_28px_80px_rgba(31,122,99,0.12)]"
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br", card.accentClass)} />
                      <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent" />

                      <div className="relative flex h-full flex-col p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-white/70 bg-white/90 text-primary shadow-sm">
                            <Icon size={24} />
                          </div>
                          <span className="rounded-full border border-primary/10 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                            {card.eyebrow}
                          </span>
                        </div>

                        <div className="mt-12 space-y-3">
                          <h2 className="text-display-sm text-ink sm:text-[1.65rem]">{card.title}</h2>
                          <p className="max-w-sm text-body leading-relaxed text-ink-muted">
                            {card.description}
                          </p>
                        </div>

                        <div className="mt-10 flex items-center justify-between border-t border-primary/10 pt-5">
                          <p className="text-body-sm text-ink-muted">
                            {card.role === "student"
                              ? "Search tutors fast"
                              : "Build your tutor presence"}
                          </p>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            Continue
                            <ArrowRight
                              size={16}
                              className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={variants.fadeSlideUp}
                className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-hairline/80 bg-white/85 px-5 py-4 text-center shadow-[0_16px_40px_rgba(26,26,26,0.05)] backdrop-blur sm:px-6"
              >
                <p className="text-body-sm text-ink-muted">
                  One platform, two focused experiences. Choose the path that matches what you need today.
                </p>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EntryGatePage;
