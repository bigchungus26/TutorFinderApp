// ── TutorOnboarding — Multi-step Wizard (Part G) ──────────────
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversities, useCourses, useUpdateProfile, useSetTutorCourses } from "@/hooks/useSupabaseQuery";
import { useUpsertAvailability } from "@/hooks/useAvailability";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { toast } from "@/components/ui/sonner";
import { variants } from "@/lib/motion";

// ── Constants ──────────────────────────────────────────────────
const STORAGE_KEY = "tutr:onboarding:tutor";

const MAJORS = [
  "Computer Science", "Business", "Engineering", "Pre-med",
  "Economics", "Architecture", "Biology", "Mathematics",
  "Psychology", "Languages",
];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const GRADES = ["A", "A-", "B+", "B", "B-"] as const;
const TOTAL_STEPS = 4;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM",
];
// 24-hr times for storage
const HOURS_24 = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
];

// ── Draft shape ────────────────────────────────────────────────
interface Draft {
  step: number;
  selectedUni: string;
  selectedMajor: string;
  selectedYear: string;
  bio: string;
  rate: number;
  mode: "online" | "in-person" | "both";
  selectedCourses: { courseId: string; grade: string }[];
  availability: Record<string, boolean>; // "dayIdx-hourIdx" → true
}

const defaultDraft: Draft = {
  step: 0,
  selectedUni: "",
  selectedMajor: "",
  selectedYear: "",
  bio: "",
  rate: 15,
  mode: "both",
  selectedCourses: [],
  availability: {},
};

// ── Slide variants factory ─────────────────────────────────────
function slideVariants(direction: "forward" | "back") {
  return direction === "forward" ? variants.slideInFromRight : variants.slideInFromLeft;
}

// ── Step Indicator ─────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 pt-6 pb-2 px-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
              i <= current
                ? "bg-accent border-accent"
                : "bg-surface border-hairline"
            }`}
          >
            {i < current ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span
                className={`text-caption font-semibold ${
                  i === current ? "text-accent-foreground" : "text-ink-muted"
                }`}
              >
                {i + 1}
              </span>
            )}
          </div>
          {i < total - 1 && (
            <div
              className={`h-px flex-1 mx-1 transition-all duration-300 ${
                i < current ? "bg-accent" : "bg-hairline"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Decorative SVG shapes per step ────────────────────────────
function StepDecoration({ step }: { step: number }) {
  const shapes = [
    <svg key={0} className="absolute -top-6 -right-6 pointer-events-none" width="160" height="160" viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <circle cx="120" cy="40" r="60" fill="hsl(152 50% 93%)" fillOpacity="0.7" />
      <circle cx="40" cy="120" r="28" fill="hsl(152 50% 93%)" fillOpacity="0.35" />
    </svg>,
    <svg key={1} className="absolute -top-4 -right-4 pointer-events-none" width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <ellipse cx="110" cy="30" rx="55" ry="45" fill="hsl(152 50% 93%)" fillOpacity="0.6" />
      <rect x="10" y="90" width="50" height="50" rx="18" fill="hsl(152 50% 93%)" fillOpacity="0.3" />
    </svg>,
    <svg key={2} className="absolute -top-6 -right-6 pointer-events-none" width="150" height="150" viewBox="0 0 150 150" fill="none" aria-hidden="true">
      <path d="M90 10 L130 60 L110 120 L40 130 L10 70 L30 15 Z" fill="hsl(152 50% 93%)" fillOpacity="0.5" />
    </svg>,
    <svg key={3} className="absolute -top-4 -right-4 pointer-events-none" width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <circle cx="100" cy="50" r="48" fill="hsl(152 50% 93%)" fillOpacity="0.55" />
      <circle cx="120" cy="105" r="25" fill="hsl(152 50% 93%)" fillOpacity="0.28" />
    </svg>,
  ];
  return <>{shapes[step] ?? null}</>;
}

// ── Availability cell key ──────────────────────────────────────
const cellKey = (dayIdx: number, hourIdx: number) => `${dayIdx}-${hourIdx}`;

// ── Main Component ─────────────────────────────────────────────
const TutorOnboarding = () => {
  const navigate = useNavigate();
  const { setSelectedUniversity } = useUniversity();
  const { user, refreshProfile } = useAuth();
  const { data: universities = [] } = useUniversities();
  const updateProfile = useUpdateProfile();
  const setTutorCourses = useSetTutorCourses();
  const upsertAvailability = useUpsertAvailability();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState(15);
  const [mode, setMode] = useState<"online" | "in-person" | "both">("both");
  const [selectedCourses, setSelectedCourses] = useState<{ courseId: string; grade: string }[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const { data: allCourses = [] } = useCourses(selectedUni || undefined);
  const filteredCourses = allCourses.filter(c =>
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // ── localStorage persistence ──────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: Draft = JSON.parse(raw);
      setStep(saved.step ?? 0);
      setSelectedUni(saved.selectedUni ?? "");
      setSelectedMajor(saved.selectedMajor ?? "");
      setSelectedYear(saved.selectedYear ?? "");
      setBio(saved.bio ?? "");
      setRate(saved.rate ?? 15);
      setMode(saved.mode ?? "both");
      setSelectedCourses(saved.selectedCourses ?? []);
      setAvailability(saved.availability ?? {});
      if (saved.step > 0) {
        toast("Picking up where you left off", { duration: 3000 });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistDraft = useCallback((patch: Partial<Draft> & { step: number }) => {
    const draft: Draft = {
      step: patch.step,
      selectedUni,
      selectedMajor,
      selectedYear,
      bio,
      rate,
      mode,
      selectedCourses,
      availability,
      ...patch,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [selectedUni, selectedMajor, selectedYear, bio, rate, mode, selectedCourses, availability]);

  const goForward = () => {
    const next = step + 1;
    setDirection("forward");
    persistDraft({ step: next });
    setStep(next);
  };

  const goBack = () => {
    const prev = step - 1;
    setDirection("back");
    persistDraft({ step: prev });
    setStep(prev);
  };

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.find(sc => sc.courseId === courseId)) {
      setSelectedCourses(prev => prev.filter(sc => sc.courseId !== courseId));
    } else {
      setSelectedCourses(prev => [...prev, { courseId, grade: "A" }]);
    }
  };

  const setGrade = (courseId: string, grade: string) => {
    setSelectedCourses(prev =>
      prev.map(sc => sc.courseId === courseId ? { ...sc, grade } : sc)
    );
  };

  const toggleCell = (dayIdx: number, hourIdx: number) => {
    const key = cellKey(dayIdx, hourIdx);
    setAvailability(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Save & finish ─────────────────────────────────────────
  const finish = async () => {
    if (!user) return;
    try {
      await updateProfile.mutateAsync({
        id: user.id,
        role: "tutor",
        university_id: selectedUni || "aub",
        major: selectedMajor,
        year: selectedYear,
        bio,
        hourly_rate: rate,
        onboarded_at: new Date().toISOString(),
      });

      if (selectedCourses.length > 0) {
        await setTutorCourses.mutateAsync({
          tutorId: user.id,
          courses: selectedCourses.map(sc => ({ course_id: sc.courseId, grade: sc.grade })),
        });
      }

      // Save availability slots
      const slots = Object.entries(availability)
        .filter(([, active]) => active)
        .map(([key]) => {
          const [dayStr, hourStr] = key.split("-");
          const dayIdx = parseInt(dayStr, 10);
          const hourIdx = parseInt(hourStr, 10);
          const start = HOURS_24[hourIdx];
          const endHour = parseInt(start.split(":")[0], 10) + 1;
          const end = `${String(endHour).padStart(2, "0")}:00`;
          return {
            tutor_id: user.id,
            day_of_week: dayIdx,
            start_time: start,
            end_time: end,
          };
        });

      if (slots.length > 0) {
        await upsertAvailability.mutateAsync({ tutorId: user.id, slots });
      }

      setSelectedUniversity(selectedUni || "aub");
      await refreshProfile();
      localStorage.removeItem(STORAGE_KEY);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to save tutor profile:", err);
    }
  };

  const saving = updateProfile.isPending || setTutorCourses.isPending || upsertAvailability.isPending;

  const canContinue = [
    !!selectedUni && !!selectedMajor && !!selectedYear, // step 0
    true,                                               // step 1 bio optional
    selectedCourses.length > 0,                        // step 2 need at least 1
    true,                                               // step 3 availability optional
  ][step] ?? true;

  const currentVariant = slideVariants(direction);

  // ── Step content ───────────────────────────────────────────
  const stepContent = [
    // ── Step 0: University, Major, Year ───────────────────
    <div key="t0" className="px-5 pt-10 pb-6 flex-1">
      <h1 className="text-display-md mb-2 text-ink">Your university</h1>
      <p className="text-body-sm text-ink-muted mb-6">
        We'll match you with students from your school.
      </p>

      <div className="space-y-3 mb-6">
        {universities.map(uni => (
          <motion.button
            key={uni.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedUni(uni.id)}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-colors ${
              selectedUni === uni.id
                ? "border-accent bg-accent-soft"
                : "border-hairline bg-surface"
            }`}
          >
            <div className="w-1 h-10 rounded-full" style={{ backgroundColor: uni.color }} />
            <div className="flex-1">
              <div className="text-label font-semibold text-ink">{uni.short_name}</div>
              <div className="text-body-sm text-ink-muted">{uni.name}</div>
            </div>
            {selectedUni === uni.id && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mb-5">
        <label className="text-label text-ink-muted mb-2 block">Major</label>
        <div className="flex flex-wrap gap-2">
          {MAJORS.map(m => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMajor(m)}
              className={`px-3.5 py-1.5 rounded-pill text-label transition-colors ${
                selectedMajor === m
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface border border-hairline text-ink"
              }`}
            >
              {m}
            </motion.button>
          ))}
        </div>
      </div>

      <label className="text-label text-ink-muted mb-2 block">Year</label>
      <select
        value={selectedYear}
        onChange={e => setSelectedYear(e.target.value)}
        className="w-full p-3.5 rounded-lg border border-hairline bg-surface text-body text-ink"
      >
        <option value="">Select your year</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>,

    // ── Step 1: Bio + Rate + Mode ──────────────────────────
    <div key="t1" className="px-5 pt-10 pb-6 flex-1">
      <h1 className="text-display-md mb-2 text-ink">Tell students about yourself</h1>
      <p className="text-body-sm text-ink-muted mb-6">
        A strong bio helps students pick you.
      </p>

      <label className="text-label text-ink-muted mb-2 block">Bio</label>
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value)}
        rows={4}
        placeholder="e.g. Senior CS student at AUB. Aced CMPS211 and CMPS303. Love breaking down complex concepts."
        className="w-full p-4 rounded-xl border border-hairline bg-surface text-body text-ink resize-none focus:outline-none focus:border-accent transition-colors mb-6"
        maxLength={300}
      />

      <label className="text-label text-ink-muted mb-2 block">Hourly rate</label>
      <div className="text-center mb-3">
        <span className="text-display-lg text-ink">${rate}</span>
        <span className="text-body text-ink-muted">/hr</span>
      </div>
      <input
        type="range"
        min={5}
        max={60}
        value={rate}
        onChange={e => setRate(Number(e.target.value))}
        className="w-full accent-accent mb-1"
      />
      <div className="flex justify-between text-caption text-ink-muted mb-6">
        <span>$5</span>
        <span>$60</span>
      </div>

      <label className="text-label text-ink-muted mb-3 block">Session mode</label>
      <div className="flex gap-2">
        {(["online", "in-person", "both"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-lg text-label capitalize transition-colors border ${
              mode === m
                ? "bg-accent-soft border-accent text-accent"
                : "bg-surface border-hairline text-ink-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>,

    // ── Step 2: Courses + Grades ───────────────────────────
    <div key="t2" className="px-5 pt-10 pb-6 flex-1 flex flex-col">
      <h1 className="text-display-md mb-2 text-ink">Courses you can teach</h1>
      <p className="text-body-sm text-ink-muted mb-4">
        Select courses and the grade you earned.
      </p>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={courseSearch}
          onChange={e => setCourseSearch(e.target.value)}
          placeholder="Search courses…"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-hairline bg-surface text-body text-ink focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Selected courses with grade picker */}
      {selectedCourses.length > 0 && (
        <div className="space-y-2 mb-3">
          {selectedCourses.map(sc => {
            const c = allCourses.find(x => x.id === sc.courseId);
            if (!c) return null;
            return (
              <div key={sc.courseId} className="flex items-center gap-2 bg-accent-soft rounded-xl p-3 border border-accent/20">
                <span className="text-label font-medium text-ink flex-1">{c.code}</span>
                <div className="flex gap-1">
                  {GRADES.map(g => (
                    <button
                      key={g}
                      onClick={() => setGrade(sc.courseId, g)}
                      className={`text-caption px-2 py-1 rounded-pill font-semibold transition-colors ${
                        sc.grade === g
                          ? "bg-accent text-accent-foreground"
                          : "bg-surface border border-hairline text-ink-muted"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleCourse(sc.courseId)}
                  className="p-1 text-ink-muted hover:text-ink"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Course list */}
      <div className="flex-1 overflow-auto space-y-1 max-h-48">
        {filteredCourses
          .filter(c => !selectedCourses.find(sc => sc.courseId === c.id))
          .map(c => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCourse(c.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent-soft transition-colors flex items-center gap-3"
            >
              <span className="text-label font-medium text-ink">{c.code}</span>
              <span className="text-body-sm text-ink-muted truncate">{c.name}</span>
            </motion.button>
          ))}
        {filteredCourses.filter(c => !selectedCourses.find(sc => sc.courseId === c.id)).length === 0 && !selectedCourses.length && (
          <p className="text-body-sm text-ink-muted text-center py-6">
            {selectedUni ? "No courses found." : "Select a university first."}
          </p>
        )}
      </div>
    </div>,

    // ── Step 3: Availability grid ──────────────────────────
    <div key="t3" className="px-5 pt-10 pb-4 flex-1 flex flex-col">
      <h1 className="text-display-md mb-2 text-ink">Your availability</h1>
      <p className="text-body-sm text-ink-muted mb-4">
        Tap cells to mark when you're free. Students will see this.
      </p>

      {/* Grid header */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-[480px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-1 mb-1">
            <div className="text-caption text-ink-muted" /> {/* time label col */}
            {DAYS.map(d => (
              <div key={d} className="text-caption font-semibold text-ink-muted text-center py-1">
                {d.charAt(0)}
              </div>
            ))}
          </div>

          {/* Time rows */}
          {HOURS.map((label, hi) => (
            <div key={hi} className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-caption text-ink-muted flex items-center pr-1 whitespace-nowrap">
                {label}
              </div>
              {DAYS.map((_, di) => {
                const key = cellKey(di, hi);
                const active = !!availability[key];
                return (
                  <motion.button
                    key={di}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleCell(di, hi)}
                    className={`h-8 rounded-md border transition-colors ${
                      active
                        ? "bg-accent-soft border-accent"
                        : "bg-surface border-hairline"
                    }`}
                    aria-label={`${DAYS[di]} ${label} ${active ? "available" : "unavailable"}`}
                    aria-pressed={active}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="text-caption text-ink-muted text-center mt-4">
        {Object.values(availability).filter(Boolean).length} slot
        {Object.values(availability).filter(Boolean).length !== 1 ? "s" : ""} selected
      </p>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Success Overlay */}
      <SuccessOverlay
        visible={showSuccess}
        title="Profile ready!"
        description="Students can now find and book you."
        onDismiss={() => navigate("/tutor/requests")}
      />

      {/* Step indicator */}
      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={currentVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex-1 flex flex-col relative overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <StepDecoration step={step} />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            {stepContent[step]}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom action zone */}
      <div className="px-5 pb-10 pt-2">
        {step > 0 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={goBack}
            className="flex items-center gap-1.5 text-ink-muted mb-4 text-body-sm"
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={goForward}
            disabled={!canContinue}
            className="w-full h-14 rounded-xl bg-accent text-accent-foreground text-label font-semibold disabled:opacity-40 transition-opacity"
          >
            Continue
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={finish}
              disabled={saving}
              className="w-full h-14 rounded-xl bg-accent text-accent-foreground text-label font-semibold disabled:opacity-40 transition-opacity"
            >
              {saving ? "Saving…" : "Start tutoring"}
            </motion.button>
            <button
              onClick={finish}
              className="w-full mt-3 text-body-sm text-ink-muted text-center"
            >
              Skip for now
            </button>
            <div className="mt-3 text-center">
              <span className="text-body-sm text-ink-muted">
                I agree to the{" "}
                <Link to="/terms" className="text-accent" target="_blank">Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-accent" target="_blank">Privacy Policy</Link>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorOnboarding;
