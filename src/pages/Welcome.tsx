// ── Welcome — Marketing Landing Page (Part K2) ─────────────────
// Shown only to logged-out users. Route guards redirect authed users.
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Star } from "lucide-react";
import { variants } from "@/lib/motion";

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
];

const HOW_IT_WORKS = [
  {
    number: "1",
    label: "Find a tutor",
    body: "Search by course, subject, or university. Filter by grade and rate.",
  },
  {
    number: "2",
    label: "Book a session",
    body: "Pick a time that works for both of you. In-person or online.",
  },
  {
    number: "3",
    label: "Learn and grow",
    body: "Have your session, leave a review, and keep improving.",
  },
];

// ── University badge color ─────────────────────────────────────
function uniBadgeClass(uni: string) {
  if (uni === "AUB") return "bg-red-50 text-red-700 border border-red-100";
  if (uni === "LAU") return "bg-blue-50 text-blue-700 border border-blue-100";
  return "bg-emerald-50 text-emerald-700 border border-emerald-100";
}

// ── Mock Tutor Card ────────────────────────────────────────────
function MockTutorCard({ tutor }: { tutor: typeof MOCK_TUTORS[0] }) {
  const initials = tutor.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-surface rounded-2xl border border-hairline p-4 w-56 shrink-0 shadow-sm">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
          <span className="text-label font-semibold text-accent">{initials}</span>
        </div>
        <div>
          <p className="text-label font-semibold text-ink leading-tight">{tutor.name}</p>
          <span className={`text-caption px-2 py-0.5 rounded-pill ${uniBadgeClass(tutor.university)}`}>
            {tutor.university}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-3">
        <Star size={13} className="text-amber-400 fill-amber-400" />
        <span className="text-label font-semibold text-ink">{tutor.rating.toFixed(1)}</span>
        <span className="text-caption text-ink-muted">({tutor.reviews})</span>
        <span className="text-caption text-ink-muted ml-auto">${tutor.hourly_rate}/hr</span>
      </div>

      {/* Courses */}
      <div className="flex flex-wrap gap-1.5">
        {tutor.courses.map(c => (
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

// ── How-it-works step ─────────────────────────────────────────
function HowStep({ number, label, body, delay }: {
  number: string;
  label: string;
  body: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={variants.fadeSlideUp}
      custom={delay}
      className="flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
        <span className="text-label font-bold text-accent">{number}</span>
      </div>
      <div className="pt-1">
        <p className="text-label font-semibold text-ink mb-0.5">{label}</p>
        <p className="text-body-sm text-ink-muted">{body}</p>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Abstract SVG background — top-right */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        width="220"
        height="220"
        viewBox="0 0 220 220"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="180" cy="40" r="80" fill="hsl(152 50% 93%)" fillOpacity="0.55" />
        <circle cx="220" cy="120" r="50" fill="hsl(152 50% 93%)" fillOpacity="0.3" />
        <circle cx="140" cy="10" r="30" fill="hsl(152 50% 93%)" fillOpacity="0.4" />
      </svg>

      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="px-5 pt-12 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="text-display-sm text-ink"
        >
          Teachme
        </motion.span>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        variants={variants.staggerChildren}
        initial="hidden"
        animate="visible"
        className="px-5 pt-8 pb-6 relative z-10"
      >
        <motion.h1
          variants={variants.fadeSlideUp}
          className="text-display-xl text-ink mb-3 max-w-xs"
        >
          Learn from students who've been there.
        </motion.h1>
        <motion.p
          variants={variants.fadeSlideUp}
          className="text-body-sm text-ink-muted mb-4 max-w-xs"
        >
          Teachme connects you with peer tutors at AUB, LAU, and NDU.
        </motion.p>

        {/* Social proof */}
        <motion.div
          variants={variants.fadeSlideUp}
          className="flex items-center gap-2 text-caption text-ink-muted flex-wrap"
        >
          <span>240+ tutors</span>
          <span>·</span>
          <span>3 universities</span>
          <span>·</span>
          <span>Built in Lebanon</span>
        </motion.div>
      </motion.div>

      {/* ── Sample tutor cards (horizontal scroll) ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18, ease: [0.2, 0, 0, 1] }}
        className="relative z-10 mb-8"
      >
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
          {MOCK_TUTORS.map(tutor => (
            <MockTutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
        {/* Fade-out right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </motion.div>

      {/* ── How it works ───────────────────────────────────────── */}
      <motion.div
        variants={variants.staggerChildren}
        initial="hidden"
        animate="visible"
        className="px-5 pb-8 relative z-10"
      >
        <motion.p
          variants={variants.fadeSlideUp}
          className="text-caption text-ink-muted uppercase tracking-wider mb-5 font-semibold"
        >
          How it works
        </motion.p>

        <div className="space-y-5">
          {HOW_IT_WORKS.map((step, i) => (
            <HowStep key={step.number} {...step} delay={i * 0.06} />
          ))}
        </div>
      </motion.div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-5 pb-44 relative z-10"
      >
        <div className="flex items-center gap-2 text-caption text-ink-muted">
          <span>Made in Beirut</span>
          <span>·</span>
          <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
        </div>
      </motion.div>

      {/* ── Sticky bottom action zone ──────────────────────────── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-surface border-t border-hairline px-5 py-4 z-50">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/signup?intent=student")}
          className="w-full h-14 rounded-xl bg-accent text-accent-foreground text-label font-semibold"
        >
          Find a tutor
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/signup?intent=tutor")}
          className="w-full h-12 mt-2 rounded-xl border border-hairline bg-surface text-ink text-label font-semibold"
        >
          Become a tutor
        </motion.button>

        <div className="mt-3 text-center">
          <Link
            to="/login"
            className="text-body-sm text-accent"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
