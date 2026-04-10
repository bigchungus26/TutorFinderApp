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
  icon: typeof BookOpen;
  accentClass: string;
}> = [
  {
    role: "student",
    eyebrow: "For students",
    title: "I'm a student",
    description: "Find trusted tutors by university, course, and budget.",
    icon: BookOpen,
    accentClass: "from-accent-soft via-white to-white",
  },
  {
    role: "tutor",
    eyebrow: "For tutors",
    title: "I'm a tutor",
    description: "Create your profile, get discovered, and grow your tutoring income.",
    icon: GraduationCap,
    accentClass: "from-secondary/45 via-white to-white",
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
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(47,191,140,0.14),_transparent_60%)]" />
        <div className="absolute left-1/2 top-24 h-40 w-40 -translate-x-[180%] rounded-full bg-accent-soft/70 blur-3xl" />
        <div className="absolute right-[-4rem] top-28 h-52 w-52 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-10">
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
                className="rounded-full border border-hairline bg-white px-4 py-2 font-medium text-ink shadow-sm transition-all hover:border-primary hover:text-primary"
              >
                Sign up
              </Link>
            </div>
          </header>

          <main className="flex flex-1 items-center py-12 sm:py-16">
            <div className="w-full">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={variants.staggerChildren}
                className="mx-auto max-w-3xl text-center"
              >
                <motion.p
                  variants={variants.fadeSlideUp}
                  className="text-overline text-primary"
                >
                  Choose your experience
                </motion.p>
                <motion.h1
                  variants={variants.fadeSlideUp}
                  className="mt-4 text-display-hero-lg leading-[1.05] sm:text-[4.25rem]"
                >
                  Find the right academic support.
                </motion.h1>
                <motion.p
                  variants={variants.fadeSlideUp}
                  className="mx-auto mt-5 max-w-2xl text-body-lg text-ink-muted leading-relaxed"
                >
                  Browse as a student or join as a tutor. We&apos;ll take you into the version of
                  TutorFinder built for that goal.
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
                      className={cn(
                        "group relative overflow-hidden rounded-[2rem] border border-hairline bg-white p-6 text-left shadow-[0_18px_50px_rgba(26,26,26,0.06)] transition-all hover:border-primary/40 hover:shadow-[0_24px_60px_rgba(31,122,99,0.12)] sm:p-7"
                      )}
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", card.accentClass)} />
                      <div className="relative flex h-full flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/70 bg-white/80 text-primary shadow-sm backdrop-blur">
                            <Icon size={24} />
                          </div>
                          <span className="rounded-full border border-primary/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
                            {card.eyebrow}
                          </span>
                        </div>

                        <div className="mt-10 space-y-3">
                          <h2 className="text-display-sm text-ink sm:text-[1.5rem]">{card.title}</h2>
                          <p className="max-w-sm text-body text-ink-muted leading-relaxed">
                            {card.description}
                          </p>
                        </div>

                        <div className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                          Continue
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={variants.fadeSlideUp}
                className="mt-8 text-center text-body-sm text-ink-muted"
              >
                You can switch roles later from the landing page.
              </motion.p>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EntryGatePage;
