import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Users,
  Search,
} from "lucide-react";
import { useUniversities, useTutors, useCourses } from "@/hooks/useSupabaseQuery";
import { TutorCard } from "@/components/TutorCard";
import { Footer } from "@/components/Footer";
import { variants } from "@/lib/motion";
import { clearSelectedRole, setSelectedRole } from "@/lib/rolePreference";

function statItem(label: string, value: string) {
  return (
    <div className="rounded-[1.6rem] border border-hairline bg-white px-4 py-5 shadow-[0_12px_30px_rgba(26,26,26,0.04)]">
      <p className="text-display-sm font-semibold text-ink">{value}</p>
      <p className="mt-2 text-body-sm text-ink-muted">{label}</p>
    </div>
  );
}

const HomeFeature = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) => (
  <div className="rounded-[1.75rem] border border-hairline bg-white p-6 shadow-[0_14px_34px_rgba(26,26,26,0.04)]">
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-primary">
      <Icon size={20} />
    </div>
    <h3 className="mt-5 text-body font-semibold text-ink">{title}</h3>
    <p className="mt-2 text-body-sm leading-relaxed text-ink-muted">{description}</p>
  </div>
);

const StudentLandingPage = () => {
  const navigate = useNavigate();
  const { data: universities = [] } = useUniversities();
  const { data: tutors = [] } = useTutors();
  const { data: courses = [] } = useCourses();

  useEffect(() => {
    setSelectedRole("student");
  }, []);

  const handleSwitchRole = () => {
    clearSelectedRole();
    navigate("/");
  };

  const topUniversities = universities.slice(0, 4);

  const featuredTutors = useMemo(() => {
    return [...tutors]
      .filter((tutor) => tutor.tutor_stats?.rating && tutor.hourly_rate != null)
      .sort((a, b) => (b.tutor_stats?.rating ?? 0) - (a.tutor_stats?.rating ?? 0))
      .slice(0, 4);
  }, [tutors]);

  const popularCourses = useMemo(() => {
    const seen = new Set<string>();
    return courses
      .filter((course) => {
        const label = `${course.code} - ${course.name}`;
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      })
      .slice(0, 6);
  }, [courses]);

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_top,_rgba(47,191,140,0.12),_transparent_62%)]" />
        <div className="absolute right-[-4rem] top-24 h-52 w-52 rounded-full bg-accent-soft/70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
          <header className="flex items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles size={16} /> TutorFinder
              </span>
            </div>
            <div className="hidden items-center gap-4 text-sm text-ink-muted sm:flex">
              <button
                type="button"
                onClick={handleSwitchRole}
                className="transition-colors hover:text-primary"
              >
                Switch role
              </button>
              <Link to="/login" className="transition-colors hover:text-primary">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink shadow-[0_10px_25px_rgba(26,26,26,0.04)] transition-all hover:border-primary hover:text-primary"
              >
                Sign up
              </Link>
            </div>
          </header>

          <div className="mt-5 sm:hidden">
            <button
              type="button"
              onClick={handleSwitchRole}
              className="inline-flex items-center rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink shadow-[0_10px_25px_rgba(26,26,26,0.04)] transition-all hover:border-primary hover:text-primary"
            >
              Switch role
            </button>
          </div>

          <section className="grid items-start gap-8 pb-12 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={variants.staggerChildren}
              className="space-y-6"
            >
              <motion.p variants={variants.fadeSlideUp} className="text-overline text-primary uppercase tracking-[0.2em]">
                Student experience
              </motion.p>
              <motion.h1 variants={variants.fadeSlideUp} className="max-w-3xl text-display-hero-lg leading-[1.03] sm:text-[4.1rem]">
                Find tutors who already know your course.
              </motion.h1>
              <motion.p variants={variants.fadeSlideUp} className="max-w-xl text-body-lg leading-relaxed text-ink-muted">
                Browse by university and subject, compare ratings and prices, and reach the right tutor fast when coursework starts piling up.
              </motion.p>

              <motion.div variants={variants.fadeSlideUp} className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.8rem] bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[0_16px_35px_rgba(47,191,140,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(47,191,140,0.24)]"
                >
                  Start as a student
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.8rem] border border-hairline bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
                >
                  Sign in to browse
                  <ArrowUpRight size={16} />
                </button>
              </motion.div>

              <motion.div
                variants={variants.fadeSlideUp}
                className="grid gap-3 sm:grid-cols-3"
              >
                {statItem("Browse by campus", "AUB, LAU, NDU")}
                {statItem("Compare quality", "4.9 star tutors")}
                {statItem("Get help fast", "50+ listings")}
              </motion.div>
            </motion.div>

            <motion.div variants={variants.fadeSlideUp} className="grid gap-4">
              <div className="rounded-[2rem] border border-hairline bg-white p-6 shadow-[0_20px_55px_rgba(26,26,26,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-caption uppercase tracking-[0.18em] text-ink-muted">Find tutors by university</div>
                    <p className="mt-1 text-body font-semibold text-ink">Start from the campus you know</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-primary">
                    Campus-first
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {topUniversities.length ? (
                    topUniversities.map((uni) => (
                      <button
                        key={uni.id}
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="rounded-[1.45rem] border border-hairline bg-background px-4 py-4 text-left transition hover:border-primary hover:bg-accent-soft/30"
                      >
                        <p className="font-display text-sm font-semibold text-ink">{uni.short_name}</p>
                        <p className="mt-1 text-body-sm text-ink-muted">{uni.name}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-body-sm text-ink-muted">Loading universities...</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-hairline bg-white p-6 shadow-[0_20px_55px_rgba(26,26,26,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                    <Search size={18} />
                  </div>
                  <div>
                    <div className="text-caption uppercase tracking-[0.18em] text-ink-muted">Most requested courses</div>
                    <p className="mt-1 text-body font-semibold text-ink">See where demand is strongest</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {popularCourses.length ? (
                    popularCourses.map((course) => (
                      <div key={course.id} className="rounded-[1.45rem] border border-hairline bg-background px-4 py-3.5">
                        <p className="text-sm font-semibold text-ink">{course.code}</p>
                        <p className="mt-1 truncate text-caption text-ink-muted">{course.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-body-sm text-ink-muted">Loading trending courses...</p>
                  )}
                </div>
              </div>
            </motion.div>
          </section>

          <section className="space-y-10 pb-16">
            <div className="grid gap-4 lg:grid-cols-3">
              <HomeFeature
                icon={ShieldCheck}
                title="Trusted tutors by university"
                description="Browse tutors who understand your campus pace, professors, and expectations."
              />
              <HomeFeature
                icon={BookOpen}
                title="Search by exact course"
                description="Go straight to the course code or subject you need help with most."
              />
              <HomeFeature
                icon={Users}
                title="Compare before you message"
                description="Review pricing, ratings, and tutor fit before you reach out."
              />
            </div>

            <div className="rounded-[2rem] border border-hairline bg-white p-7 shadow-[0_18px_45px_rgba(26,26,26,0.05)] sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-overline text-primary uppercase tracking-[0.2em]">How it works</p>
                  <h2 className="mt-3 text-display-sm text-ink sm:text-[2rem]">
                    A cleaner way to search, compare, and get academic help quickly.
                  </h2>
                </div>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_14px_30px_rgba(47,191,140,0.18)] transition hover:-translate-y-0.5"
                >
                  Create student account
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-hairline bg-background p-5">
                  <p className="text-caption uppercase tracking-[0.18em] text-ink-muted">01</p>
                  <h3 className="mt-3 text-body font-semibold text-ink">Search by course</h3>
                  <p className="mt-2 text-body-sm text-ink-muted">Filter by university, course, budget, and rating.</p>
                </div>
                <div className="rounded-[1.6rem] border border-hairline bg-background p-5">
                  <p className="text-caption uppercase tracking-[0.18em] text-ink-muted">02</p>
                  <h3 className="mt-3 text-body font-semibold text-ink">Compare tutors</h3>
                  <p className="mt-2 text-body-sm text-ink-muted">Review pricing, profile strength, and student feedback.</p>
                </div>
                <div className="rounded-[1.6rem] border border-hairline bg-background p-5">
                  <p className="text-caption uppercase tracking-[0.18em] text-ink-muted">03</p>
                  <h3 className="mt-3 text-body font-semibold text-ink">Message and book</h3>
                  <p className="mt-2 text-body-sm text-ink-muted">Reach out quickly once you find the right match.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-overline text-primary uppercase tracking-[0.2em]">Featured tutors</p>
                  <h2 className="mt-3 text-display-sm text-ink sm:text-[2rem]">
                    Top-rated peer tutors across Lebanon.
                  </h2>
                </div>
                <Link to="/signup" className="text-sm font-semibold text-primary hover:underline">
                  Unlock student access
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {featuredTutors.length ? (
                  featuredTutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)
                ) : (
                  <div className="rounded-[1.75rem] border border-hairline bg-white p-8 text-center text-ink-muted">
                    Loading featured tutors...
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentLandingPage;
