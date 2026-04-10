import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { variants } from "@/lib/motion";
import { setSelectedRole } from "@/lib/rolePreference";

const highlights = [
  {
    title: "Build a polished tutor profile",
    description: "Present your subjects, pricing, experience, and availability clearly from the start.",
    icon: GraduationCap,
  },
  {
    title: "Reach students from your university",
    description: "Get discovered by students who are actively looking for support in familiar campus courses.",
    icon: Users,
  },
  {
    title: "Run tutoring like a product",
    description: "Manage listing visibility, requests, and subscription-ready profile details in one place.",
    icon: LayoutDashboard,
  },
];

const TutorLandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedRole("tutor");
  }, []);

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_top_right,_rgba(31,122,99,0.16),_transparent_60%)]" />
        <div className="absolute left-[-4rem] top-28 h-48 w-48 rounded-full bg-secondary/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
          <header className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles size={16} />
              TutorFinder
            </span>

            <div className="flex items-center gap-3 text-sm">
              <Link to="/?switch=1" className="text-ink-muted transition-colors hover:text-primary">
                Switch role
              </Link>
              <Link to="/login" className="text-ink-muted transition-colors hover:text-primary">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-hairline bg-white px-4 py-2 font-medium text-ink shadow-[0_10px_25px_rgba(26,26,26,0.04)] transition-all hover:border-primary hover:text-primary"
              >
                Join now
              </Link>
            </div>
          </header>

          <section className="grid gap-8 pb-12 pt-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12 lg:pt-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={variants.staggerChildren}
              className="space-y-6"
            >
              <motion.p variants={variants.fadeSlideUp} className="text-overline text-primary">
                Tutor experience
              </motion.p>
              <motion.h1
                variants={variants.fadeSlideUp}
                className="max-w-3xl text-display-hero-lg leading-[1.03] sm:text-[4.1rem]"
              >
                Turn your academic strengths into a credible tutoring presence.
              </motion.h1>
              <motion.p
                variants={variants.fadeSlideUp}
                className="max-w-xl text-body-lg leading-relaxed text-ink-muted"
              >
                Join TutorFinder to create a profile students trust, get discovered by your campus community, and manage tutoring as a serious income stream.
              </motion.p>

              <motion.div variants={variants.fadeSlideUp} className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.8rem] bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(31,122,99,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(31,122,99,0.22)]"
                >
                  Join as a tutor
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.8rem] border border-hairline bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
                >
                  Sign in to manage profile
                  <ArrowUpRight size={16} />
                </button>
              </motion.div>

              <motion.div variants={variants.fadeSlideUp} className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-hairline bg-white px-4 py-5 shadow-[0_12px_30px_rgba(26,26,26,0.04)]">
                  <p className="text-display-sm font-semibold text-ink">Set your rate</p>
                  <p className="mt-2 text-body-sm text-ink-muted">List pricing with clarity from day one.</p>
                </div>
                <div className="rounded-[1.6rem] border border-hairline bg-white px-4 py-5 shadow-[0_12px_30px_rgba(26,26,26,0.04)]">
                  <p className="text-display-sm font-semibold text-ink">Show your subjects</p>
                  <p className="mt-2 text-body-sm text-ink-muted">Highlight the courses you can confidently teach.</p>
                </div>
                <div className="rounded-[1.6rem] border border-hairline bg-white px-4 py-5 shadow-[0_12px_30px_rgba(26,26,26,0.04)]">
                  <p className="text-display-sm font-semibold text-ink">Stay discoverable</p>
                  <p className="mt-2 text-body-sm text-ink-muted">Keep your listing active and student-facing.</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={variants.staggerChildren}
              className="grid gap-4"
            >
              <motion.div
                variants={variants.fadeSlideUp}
                className="rounded-[2rem] border border-hairline bg-white p-6 shadow-[0_20px_55px_rgba(26,26,26,0.06)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-caption uppercase tracking-[0.18em] text-ink-muted">Tutor profile preview</p>
                    <p className="mt-1 text-body font-semibold text-ink">Built to earn trust quickly</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-primary">
                    Listing-ready
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.6rem] border border-hairline bg-background p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-body font-semibold text-ink">Dana K.</p>
                        <p className="mt-1 text-body-sm text-ink-muted">AUB • Economics • Financial Accounting</p>
                      </div>
                      <div className="rounded-2xl bg-accent-soft px-3 py-2 text-right">
                        <p className="text-caption uppercase tracking-[0.16em] text-primary">From</p>
                        <p className="text-body font-semibold text-primary">$20/hr</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.6rem] border border-hairline bg-background p-4">
                      <p className="text-caption uppercase tracking-[0.16em] text-ink-muted">Subjects</p>
                      <p className="mt-2 text-body font-semibold text-ink">ACC 210, ECON 211, Intro Stats</p>
                    </div>
                    <div className="rounded-[1.6rem] border border-hairline bg-background p-4">
                      <p className="text-caption uppercase tracking-[0.16em] text-ink-muted">Availability</p>
                      <p className="mt-2 text-body font-semibold text-ink">Weeknights, weekends, exam prep</p>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-primary/15 bg-primary p-5 text-white">
                    <div className="flex items-center gap-3">
                      <BadgeDollarSign size={20} />
                      <p className="text-body font-semibold">Designed for profile growth</p>
                    </div>
                    <p className="mt-2 text-body-sm text-white/80">
                      Present your expertise clearly, stay visible, and manage incoming student demand from one focused place.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={variants.fadeSlideUp}
                className="rounded-[2rem] border border-hairline bg-white p-6 shadow-[0_18px_45px_rgba(26,26,26,0.05)]"
              >
                <p className="text-caption uppercase tracking-[0.18em] text-ink-muted">What tutors need</p>
                <div className="mt-4 space-y-3">
                  {[
                    "Show the right subjects and rates clearly",
                    "Reach students from familiar universities",
                    "Manage a subscription-ready public listing",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.25rem] bg-background px-4 py-3">
                      <CheckCircle2 size={18} className="mt-0.5 text-primary" />
                      <p className="text-body-sm text-ink-muted">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </section>

          <section className="space-y-6 pb-16">
            <div className="max-w-2xl">
              <p className="text-overline text-primary">Why tutors choose it</p>
              <h2 className="mt-3 text-display-sm text-ink sm:text-[2rem]">
                A calm, focused platform for getting discovered and staying organized.
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.75rem] border border-hairline bg-white p-6 shadow-[0_14px_34px_rgba(26,26,26,0.04)]"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-5 text-body font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-body-sm leading-relaxed text-ink-muted">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TutorLandingPage;
