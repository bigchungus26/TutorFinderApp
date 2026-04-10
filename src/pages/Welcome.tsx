// ── Welcome — Landing Page (Part 3 of polish pass) ───────────
// Shown only to logged-out users. Route guards redirect authed users.
import { useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Star } from "lucide-react";
import { variants } from "@/lib/motion";
// AmbientBackground is rendered globally in App.tsx — no need to duplicate here

// ── Static mock tutor data ─────────────────────────────────────
const MOCK_TUTORS = [
  {
    id: "1",
    name: "Karim Haddad",
    university: "AUB",
    rating: 4.9,
    reviews: 32,
    courses: ["CMPS211", "CMPS303", "MATH201"],
    hourly_rate: 22,
  },
  {
    id: "2",
    name: "Lea Nassar",
    university: "LAU",
    rating: 5.0,
    reviews: 18,
    courses: ["BIOL201", "CHEM101", "MATH101"],
    hourly_rate: 18,
  },
  {
    id: "3",
    name: "Rami Khalil",
    university: "NDU",
    rating: 4.8,
    reviews: 41,
    courses: ["ECON201", "BUSN301", "STAT202"],
    hourly_rate: 20,
  },
  {
    id: "4",
    name: "Sara Frem",
    university: "AUB",
    rating: 4.9,
    reviews: 27,
    courses: ["BIOL301", "CHEM201", "STAT101"],
    hourly_rate: 24,
  },
];

// ── University badge styling ───────────────────────────────────
function uniBadgeClass(uni: string) {
  if (uni === "AUB") return "bg-red-50 text-red-700 border border-red-100";
  if (uni === "LAU") return "bg-blue-50 text-blue-700 border border-blue-100";
  return "bg-emerald-50 text-emerald-700 border border-emerald-100";
}

// ── Mock Tutor Card ────────────────────────────────────────────
function MockTutorCard({ tutor }: { tutor: (typeof MOCK_TUTORS)[0] }) {
  const initials = tutor.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="bg-surface rounded-2xl border border-hairline p-4 shrink-0 shadow-sm"
      style={{ width: 220 }}
      aria-hidden="true"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
          <span className="text-label font-semibold text-accent">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-label font-semibold text-ink leading-tight truncate">
            {tutor.name}
          </p>
          <span
            className={`text-caption px-2 py-0.5 rounded-pill inline-block mt-0.5 ${uniBadgeClass(tutor.university)}`}
          >
            {tutor.university}
          </span>
        </div>
      </div>

      {/* Rating + rate */}
      <div className="flex items-center gap-1.5 mb-3">
        <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
        <span className="text-label font-semibold text-ink">
          {tutor.rating.toFixed(1)}
        </span>
        <span className="text-caption text-ink-muted">({tutor.reviews})</span>
        <span className="text-caption text-ink-muted ml-auto whitespace-nowrap">
          ${tutor.hourly_rate}/hr
        </span>
      </div>

      {/* Course chips */}
      <div className="flex flex-wrap gap-1.5">
        {tutor.courses.slice(0, 3).map((c) => (
          <span
            key={c}
            className="text-caption bg-accent-soft text-accent px-2 py-0.5 rounded-pill font-medium"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Autoplaying carousel ───────────────────────────────────────
// Uses CSS keyframe animation on a duplicated list for a seamless loop.
function TutorCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const pauseAnimation = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "paused";
    }
  };

  const resumeAnimation = () => {
    if (trackRef.current) {
      trackRef.current.style.animationPlayState = "running";
    }
  };

  // Duplicate list for seamless looping
  const items = [...MOCK_TUTORS, ...MOCK_TUTORS];

  return (
    <div
      className="relative overflow-hidden"
      style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
    >
      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .carousel-track {
          animation: scrollLeft 20s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .carousel-track {
            animation: none;
          }
        }
      `}</style>

      <div
        ref={trackRef}
        className="carousel-track flex"
        style={{ gap: 12, width: "max-content" }}
        onTouchStart={pauseAnimation}
        onTouchEnd={resumeAnimation}
      >
        {items.map((tutor, i) => (
          <MockTutorCard key={`${tutor.id}-${i}`} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] bg-transparent flex flex-col relative overflow-hidden"
      style={{ maxHeight: "100dvh" }}
    >

      {/* ── Logo wordmark ────────────────────────────────────── */}
      <div className="px-6 pt-12 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
          className="text-display-sm text-ink select-none"
        >
          Tutr
        </motion.span>
      </div>

      {/* ── Hero zone — fills from logo to carousel ──────────── */}
      <div
        className="relative z-10 flex flex-col justify-end px-6 flex-1"
        style={{ paddingBottom: "1.5rem", minHeight: 0 }}
      >
        <motion.div
          variants={variants.staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {/* Headline */}
          <motion.h1
            variants={variants.fadeSlideUp}
            className="mb-4"
            style={{ maxWidth: 360, color: "#1a1a1a" }}
          >
            <span className="block text-display-xl sm:text-display-hero leading-tight">
              Learn from students
            </span>
            <span className="block text-display-xl sm:text-display-hero leading-tight">
              who've{" "}
              <em
                className="text-display-xl sm:text-display-hero"
                style={{
                  fontStyle: "italic",
                  fontFamily: "'Fraunces', serif",
                }}
              >
                been there.
              </em>
            </span>
          </motion.h1>

          {/* Sub-headline — max 12 words */}
          <motion.p
            variants={variants.fadeSlideUp}
            className="text-body"
            style={{ maxWidth: 320, color: "#4a4a4a" }}
          >
            Peer tutors at AUB, LAU, and NDU. Students only.
          </motion.p>
        </motion.div>
      </div>

      {/* ── Tutor carousel ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.2, ease: [0.2, 0, 0, 1] }}
        className="relative z-10 pb-4 shrink-0"
      >
        <TutorCarousel />
      </motion.div>

      {/* ── Spacer for fixed bottom CTA (160px) ──────────────── */}
      <div className="shrink-0" style={{ height: 164 }} />

      {/* ── Sticky bottom action zone ──────────────────────────── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 28%)",
          paddingTop: "2rem",
        }}
      >
        <div className="px-5 pb-safe" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
          {/* Primary CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/signup?intent=student")}
            className="w-full h-14 rounded-xl bg-accent text-accent-foreground font-display font-medium text-base tracking-[-0.01em] transition-opacity active:opacity-90"
          >
            Find a tutor
          </motion.button>

          {/* Secondary CTA — ghost text with arrow */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/signup?intent=tutor")}
            className="w-full h-12 mt-2 text-center text-body text-ink-muted hover:text-ink transition-colors"
          >
            Become a tutor →
          </motion.button>

          {/* Sign-in link */}
          <div className="mt-1 text-center">
            <Link
              to="/login"
              className="text-caption text-accent hover:underline transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-3" style={{ color: "#6b6b6b", fontSize: "0.75rem" }}>
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
