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
} from "lucide-react";
import { useUniversities, useTutors, useCourses } from "@/hooks/useSupabaseQuery";
import { TutorCard } from "@/components/TutorCard";
import { Footer } from "@/components/Footer";
import { variants } from "@/lib/motion";
import { setSelectedRole } from "@/lib/rolePreference";

function statItem(label: string, value: string) {
  return (
    <div className="rounded-3xl border border-hairline bg-white p-4 text-center">
      <p className="text-display-sm font-semibold text-ink">{value}</p>
      <p className="mt-1 text-body-sm text-ink-muted">{label}</p>
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
  <div className="rounded-3xl border border-hairline bg-white p-5 text-left">
    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-primary">
      <Icon size={20} />
    </div>
    <h3 className="mb-2 text-body font-semibold text-ink">{title}</h3>
    <p className="text-body-sm leading-relaxed text-ink-muted">{description}</p>
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
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles size={16} /> TutorFinder
            </span>
          </div>
          <div className="hidden items-center gap-4 text-sm text-ink-muted sm:flex">
            <Link to="/?switch=1" className="transition-colors hover:text-primary">
              Switch role
            </Link>
            <Link to="/login" className="transition-colors hover:text-primary">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink transition-all hover:border-primary hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </header>

        <section className="grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variants.staggerChildren}
            className="space-y-6"
          >
            <motion.p variants={variants.fadeSlideUp} className="text-overline text-primary uppercase tracking-[0.2em]">
              Student view
            </motion.p>
            <motion.h1 variants={variants.fadeSlideUp} className="max-w-3xl text-display-hero-lg leading-tight sm:text-[3.75rem]">
              Find tutors who have actually taken your course.
            </motion.h1>
            <motion.p variants={variants.fadeSlideUp} className="max-w-xl text-body-lg leading-relaxed text-ink-muted">
              Search by university and course, compare ratings and prices, and get help fast from verified peer tutors who match your academic context.
            </motion.p>

            <motion.div variants={variants.fadeSlideUp} className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center gap-2 rounded-[1.75rem] bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/10 transition hover:shadow-md"
              >
                Start as a student
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 rounded-[1.75rem] border border-hairline bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
              >
                Sign in to browse
                <ArrowUpRight size={16} />
              </button>
            </motion.div>

            <motion.div variants={variants.fadeSlideUp} className="grid gap-4 sm:grid-cols-3">
              {statItem("Browse by campus", "AUB - LAU - NDU")}
              {statItem("Compare quality", "4.9 star tutors")}
              {statItem("Get help fast", "50+ listings")}
            </motion.div>
          </motion.div>

          <motion.div variants={variants.fadeSlideUp} className="grid gap-4">
            <div className="rounded-4xl border border-hairline bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-caption uppercase tracking-[0.18em] text-ink-muted">Campus spotlight</div>
                  <p className="text-body font-semibold text-ink">Find tutors by university</p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-primary">Campus-first</span>
              </div>
              <div className="grid gap-3">
                {topUniversities.length ? (
                  topUniversities.map((uni) => (
                    <button
                      key={uni.id}
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="rounded-3xl border border-hairline bg-background px-4 py-4 text-left transition hover:border-primary hover:bg-accent-soft/35"
                    >
                      <p className="font-display text-sm font-semibold text-ink">{uni.short_name}</p>
                      <p className="text-body-sm text-ink-muted">{uni.name}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-body-sm text-ink-muted">Loading universities...</p>
                )}
              </div>
            </div>
            <div className="rounded-4xl border border-hairline bg-white p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-caption uppercase tracking-[0.18em] text-ink-muted">Top subjects</div>
                <p className="text-body font-semibold text-ink">Most requested courses</p>
              </div>
              <div className="grid gap-3">
                {popularCourses.length ? (
                  popularCourses.map((course) => (
                    <div key={course.id} className="rounded-3xl border border-hairline bg-background px-4 py-3">
                      <p className="text-sm font-semibold text-ink">{course.code}</p>
                      <p className="truncate text-caption text-ink-muted">{course.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-body-sm text-ink-muted">Loading trending courses...</p>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-16 space-y-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <HomeFeature
              icon={ShieldCheck}
              title="Trusted tutors by university"
              description="Browse tutors who actually know your campus, teaching style, and course expectations."
            />
            <HomeFeature
              icon={BookOpen}
              title="Search by course"
              description="Find support for the exact subject you need, from accounting and economics to coding and exam prep."
            />
            <HomeFeature
              icon={Users}
              title="Compare before you commit"
              description="Review pricing, ratings, and profile details side by side before you message a tutor."
            />
          </div>

          <div className="rounded-[2rem] border border-hairline bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-3 text-overline text-primary uppercase tracking-[0.2em]">How it works</p>
                <h2 className="text-display-sm text-ink">Search, compare, and reach out with confidence.</h2>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/10 transition hover:shadow-md"
              >
                Create student account
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-hairline bg-background p-5">
                <p className="mb-3 text-caption uppercase tracking-[0.18em] text-ink-muted">01</p>
                <h3 className="mb-2 text-body font-semibold text-ink">Search by course</h3>
                <p className="text-body-sm text-ink-muted">Browse tutors by university, course, budget, and rating.</p>
              </div>
              <div className="rounded-3xl border border-hairline bg-background p-5">
                <p className="mb-3 text-caption uppercase tracking-[0.18em] text-ink-muted">02</p>
                <h3 className="mb-2 text-body font-semibold text-ink">Compare tutors</h3>
                <p className="text-body-sm text-ink-muted">Review pricing, teaching style, and social proof before reaching out.</p>
              </div>
              <div className="rounded-3xl border border-hairline bg-background p-5">
                <p className="mb-3 text-caption uppercase tracking-[0.18em] text-ink-muted">03</p>
                <h3 className="mb-2 text-body font-semibold text-ink">Message and book</h3>
                <p className="text-body-sm text-ink-muted">Start the conversation quickly when you find the right fit.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-overline text-primary uppercase tracking-[0.2em]">Featured tutors</p>
                <h2 className="text-display-sm text-ink">Top-rated peer tutors across Lebanon.</h2>
              </div>
              <Link to="/signup" className="text-sm font-semibold text-primary hover:underline">
                Unlock student access
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredTutors.length ? (
                featuredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))
              ) : (
                <div className="rounded-3xl border border-hairline bg-white p-8 text-center text-ink-muted">
                  Loading featured tutors...
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default StudentLandingPage;
