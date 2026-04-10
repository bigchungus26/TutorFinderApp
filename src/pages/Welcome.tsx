import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
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

function statItem(label: string, value: string) {
  return (
    <div className="rounded-3xl border border-hairline bg-surface p-4 text-center">
      <p className="text-display-sm font-semibold text-ink">{value}</p>
      <p className="text-body-sm text-ink-muted mt-1">{label}</p>
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
  <div className="rounded-3xl border border-hairline bg-surface p-5 text-left">
    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-accent-soft text-accent mb-4">
      <Icon size={20} />
    </div>
    <h3 className="text-body font-semibold text-ink mb-2">{title}</h3>
    <p className="text-body-sm text-ink-muted leading-relaxed">{description}</p>
  </div>
);

const WelcomePage = () => {
  const navigate = useNavigate();
  const { data: universities = [] } = useUniversities();
  const { data: tutors = [] } = useTutors();
  const { data: courses = [] } = useCourses();

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
        const label = `${course.code} • ${course.name}`;
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      })
      .slice(0, 6);
  }, [courses]);

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="max-w-6xl mx-auto px-5 py-8 sm:py-12">
        <header className="flex items-center justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              <Sparkles size={16} /> TutorFinder
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-ink-muted">
            <Link to="/login" className="hover:text-accent transition-colors">Sign in</Link>
            <Link
              to="/signup"
              className="rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink transition-all hover:border-accent hover:text-accent"
            >
              Sign up
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={variants.staggerChildren}
            className="space-y-6"
          >
            <motion.p variants={variants.fadeSlideUp} className="text-overline text-accent uppercase tracking-[0.2em]">
              Lebanon’s peer tutoring marketplace
            </motion.p>
            <motion.h1 variants={variants.fadeSlideUp} className="text-display-hero-lg sm:text-[3.5rem] leading-tight max-w-3xl">
              Find tutors who’ve actually taken your course.
            </motion.h1>
            <motion.p variants={variants.fadeSlideUp} className="max-w-xl text-body-lg text-ink-muted leading-relaxed">
              Search by university, course, rating and availability. Compare verified peer tutors from AUB, LAU, NDU and more.
            </motion.p>

            <motion.div variants={variants.fadeSlideUp} className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center gap-2 rounded-[1.75rem] bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/10 transition hover:shadow-md"
              >
                Find a tutor
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center gap-2 rounded-[1.75rem] border border-hairline bg-surface px-6 py-3 text-sm font-semibold text-ink transition hover:border-accent"
              >
                Become a tutor
                <ArrowUpRight size={16} />
              </button>
            </motion.div>

            <motion.div variants={variants.fadeSlideUp} className="grid gap-4 sm:grid-cols-3">
              {statItem("Lebanese universities", "AUB • LAU • NDU")}
              {statItem("Average rating", "4.9 stars")}
              {statItem("Profile-ready tutors", "50+ listings")}
            </motion.div>
          </motion.div>

          <motion.div variants={variants.fadeSlideUp} className="grid gap-4">
            <div className="rounded-4xl border border-hairline bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-caption uppercase tracking-[0.18em] text-ink-muted">Campus spotlight</div>
                  <p className="text-body font-semibold text-ink">Browse by university</p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">Campus-first</span>
              </div>
              <div className="grid gap-3">
                {topUniversities.length ? (
                  topUniversities.map((uni) => (
                    <button
                      key={uni.id}
                      type="button"
                      onClick={() => navigate("/search")}
                      className="rounded-3xl border border-hairline bg-surface-elevated px-4 py-4 text-left transition hover:border-accent hover:bg-accent-soft/40"
                    >
                      <p className="font-display text-sm font-semibold text-ink">{uni.short_name}</p>
                      <p className="text-body-sm text-ink-muted">{uni.name}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-body-sm text-ink-muted">Loading universities…</p>
                )}
              </div>
            </div>
            <div className="rounded-4xl border border-hairline bg-surface p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-caption uppercase tracking-[0.18em] text-ink-muted">Top subjects</div>
                <p className="text-body font-semibold text-ink">Most requested courses</p>
              </div>
              <div className="grid gap-3">
                {popularCourses.length ? (
                  popularCourses.map((course) => (
                    <div key={course.id} className="rounded-3xl border border-hairline bg-surface-elevated px-4 py-3">
                      <p className="text-sm font-semibold text-ink">{course.code}</p>
                      <p className="text-caption text-ink-muted truncate">{course.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-body-sm text-ink-muted">Loading trending courses…</p>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-16 space-y-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <HomeFeature
              icon={ShieldCheck}
              title="Verified campus tutors"
              description="Browse tutors who study your university courses and share your academic context."
            />
            <HomeFeature
              icon={BookOpen}
              title="Transparent pricing"
              description="Compare hourly rates, ratings, and teaching style before you book."
            />
            <HomeFeature
              icon={Users}
              title="Fast matching"
              description="Find available tutors by university, course, and session format."
            />
          </div>

          <div className="rounded-[2rem] border border-hairline bg-surface p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-overline text-accent uppercase tracking-[0.2em] mb-3">How it works</p>
                <h2 className="text-display-sm text-ink">Search, compare, and book confident campus support.</h2>
              </div>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/10 transition hover:shadow-md"
              >
                Start browsing
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-hairline bg-white p-5">
                <p className="text-caption uppercase tracking-[0.18em] text-ink-muted mb-3">01</p>
                <h3 className="text-body font-semibold text-ink mb-2">Search by course</h3>
                <p className="text-body-sm text-ink-muted">Filter tutors by university, course, price, rating, and availability.</p>
              </div>
              <div className="rounded-3xl border border-hairline bg-white p-5">
                <p className="text-caption uppercase tracking-[0.18em] text-ink-muted mb-3">02</p>
                <h3 className="text-body font-semibold text-ink mb-2">Review profiles</h3>
                <p className="text-body-sm text-ink-muted">Compare teaching experience, student reviews, and hourly rates in one view.</p>
              </div>
              <div className="rounded-3xl border border-hairline bg-white p-5">
                <p className="text-caption uppercase tracking-[0.18em] text-ink-muted mb-3">03</p>
                <h3 className="text-body font-semibold text-ink mb-2">Send a request</h3>
                <p className="text-body-sm text-ink-muted">Message tutors directly and request a session with clear availability options.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-overline text-accent uppercase tracking-[0.2em]">Featured tutors</p>
                <h2 className="text-display-sm text-ink">Top-rated peer tutors across Lebanon.</h2>
              </div>
              <Link to="/search" className="text-sm font-semibold text-accent hover:underline">
                See all tutors
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredTutors.length ? (
                featuredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))
              ) : (
                <div className="rounded-3xl border border-hairline bg-surface p-8 text-center text-ink-muted">
                  Loading featured tutors…
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-hairline bg-surface p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-center">
            <div>
              <p className="text-overline text-accent uppercase tracking-[0.2em] mb-3">For tutors</p>
              <h2 className="text-display-sm text-ink">Build a profile that students trust.</h2>
              <p className="text-body-lg text-ink-muted mt-4 max-w-xl leading-relaxed">
                Join TutorFinder to reach university students across Lebanon, showcase your strengths, and manage a public listing with subscription-ready tools.
              </p>
              <ul className="mt-6 space-y-3 text-body-sm text-ink-muted">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent">✓</span>
                  Add your courses, rates, availability, and student reviews.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent">✓</span>
                  Keep your listing public with an easy subscription model.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent">✓</span>
                  Manage requests, messages, and bookings from one dashboard.
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-[1.75rem] bg-ink px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-[#111]"
                >
                  Start your tutor profile
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="rounded-4xl border border-hairline bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-ink-muted">Tutor package</p>
                  <p className="text-body font-semibold text-ink">Ready for launch</p>
                </div>
              </div>
              <div className="grid gap-4 text-body-sm text-ink-muted">
                <div className="rounded-3xl border border-hairline p-4 bg-surface">
                  <p className="font-semibold text-ink">Subscription-ready layout</p>
                  <p>Prepare your profile for public visibility and recurring plan management.</p>
                </div>
                <div className="rounded-3xl border border-hairline p-4 bg-surface">
                  <p className="font-semibold text-ink">Focus on university students</p>
                  <p>Reach learners from Lebanon’s most trusted campuses with a targeted marketplace.</p>
                </div>
                <div className="rounded-3xl border border-hairline p-4 bg-surface">
                  <p className="font-semibold text-ink">Simple onboarding</p>
                  <p>Complete your profile, add courses and availability, and go live quickly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default WelcomePage;
