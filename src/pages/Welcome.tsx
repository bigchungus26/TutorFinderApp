// ============================================================
// Welcome — Part 2.4
// Landing page for logged-out users.
// Ambient blobs, headline "Learn from students who've been there",
// carousel of sample tutor cards, sticky bottom CTAs.
// ============================================================
import { useEffect, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Star, BadgeCheck } from "lucide-react";
import { variants, springs } from "@/lib/motion";
import { setSelectedRole } from "@/lib/rolePreference";

// ── Mock tutor preview data ────────────────────────────────────
const MOCK_TUTORS = [
  { id: "1", name: "Karim Haddad",   uni: "AUB", uniColor: "#8B0000", rating: 4.9, reviews: 32, courses: ["CMPS211", "CMPS303"], rate: 22, verified: true  },
  { id: "2", name: "Sara Khalil",    uni: "LAU", uniColor: "#003DA5", rating: 4.7, reviews: 18, courses: ["MATH201", "PHYS201"], rate: 18, verified: true  },
  { id: "3", name: "Elie Nassar",    uni: "NDU", uniColor: "#0B6E4F", rating: 4.8, reviews: 24, courses: ["BIOL201", "CHEM201"], rate: 20, verified: false },
  { id: "4", name: "Nour Mansour",   uni: "AUB", uniColor: "#8B0000", rating: 5.0, reviews: 41, courses: ["ECON201", "MGMT302"], rate: 25, verified: true  },
  { id: "5", name: "Maya Toufayli",  uni: "LAU", uniColor: "#003DA5", rating: 4.6, reviews: 12, courses: ["ENGL201", "COMM301"], rate: 16, verified: false },
];

// ── Mini tutor preview card ────────────────────────────────────
function PreviewCard({ tutor }: { tutor: typeof MOCK_TUTORS[0] }) {
  return (
    <div
      className="flex-shrink-0 w-[200px] bg-surface border border-border rounded-xl overflow-hidden shadow-xs"
      aria-hidden="true"
    >
      <div className="h-1" style={{ background: tutor.uniColor }} />
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-caption font-bold text-white flex-shrink-0"
            style={{ background: tutor.uniColor }}
          >
            {tutor.name.split(" ").map(w => w[0]).join("")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-body-sm font-semibold text-foreground truncate">{tutor.name}</span>
              {tutor.verified && <BadgeCheck size={12} className="text-accent flex-shrink-0" />}
            </div>
            <span className="text-caption text-ink-muted">{tutor.uni}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {tutor.courses.map(c => (
            <span key={c} className="text-label px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: tutor.uniColor + "14", color: tutor.uniColor }}>
              {c}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-accent fill-accent" />
            <span className="text-caption font-semibold">{tutor.rating}</span>
            <span className="text-caption text-ink-muted">({tutor.reviews})</span>
          </div>
          <span className="text-caption font-semibold" style={{ color: tutor.uniColor }}>
            ${tutor.rate}/hr
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Auto-scrolling carousel ────────────────────────────────────
function TutorCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const posRef = useRef(0);

  useAnimationFrame(() => {
    if (pausedRef.current || !scrollRef.current) return;
    posRef.current += 0.4;
    const el = scrollRef.current;
    const max = el.scrollWidth / 2;
    if (posRef.current >= max) posRef.current = 0;
    el.scrollLeft = posRef.current;
  });

  // Doubled list for seamless loop
  const doubled = [...MOCK_TUTORS, ...MOCK_TUTORS];

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-hidden select-none"
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { pausedRef.current = false; }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      aria-hidden="true"
    >
      {doubled.map((t, i) => (
        <PreviewCard key={`${t.id}-${i}`} tutor={t} />
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Noise */}
      <div className="noise-bg" aria-hidden="true" />

      {/* Ambient blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          top: "-20%", left: "-20%",
          background: "radial-gradient(circle, rgba(43,166,106,0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 500,
          bottom: "-15%", right: "-15%",
          background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="px-6 pt-14 pb-6">
          <motion.div
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <p className="text-overline text-accent mb-3">TUTR</p>
            <h1 className="text-display text-foreground mb-3" style={{ lineHeight: 1.05 }}>
              Learn from students who've{" "}
              <em style={{ fontStyle: "italic" }}>been there.</em>
            </h1>
            <p className="text-body text-ink-muted leading-relaxed">
              Connect with top-performing peers at AUB, LAU, and NDU who aced your exact courses.
            </p>
          </motion.div>
        </div>

        {/* Tutor carousel */}
        <motion.div
          variants={variants.fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mb-8 -mx-0 px-6"
        >
          <TutorCarousel />
        </motion.div>

        {/* Spacer to push CTAs down on tall screens */}
        <div className="flex-1" />
      </div>

      {/* Sticky bottom CTAs */}
      <motion.div
        variants={variants.fadeSlideUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="relative z-10 px-6 pb-10 pt-4 flex flex-col gap-3"
        style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 0) + 1.5rem)" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          onClick={() => { setSelectedRole("student"); navigate("/signup"); }}
          className="w-full h-14 rounded-xl text-white font-semibold text-body"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            boxShadow: "0 8px 24px rgba(43,166,106,0.3)",
          }}
        >
          Find a tutor
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          onClick={() => { setSelectedRole("tutor"); navigate("/signup"); }}
          className="w-full h-12 rounded-xl border border-border text-foreground font-medium text-body bg-surface"
        >
          Become a tutor
        </motion.button>

        <p className="text-center text-body-sm text-ink-muted mt-1">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>

        <div className="flex justify-center gap-5 mt-2">
          <Link to="/privacy" className="text-label text-ink-muted hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms"   className="text-label text-ink-muted hover:text-foreground transition-colors">Terms</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
