// ============================================================
// TutorOnboarding — Part 2.8
// 4-step wizard: university/major/year → bio/rate/mode → courses → availability
// Filling pill progress bar, horizontal slide, spring CTA
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, X, Check } from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversities, useCourses, useUpdateProfile, useSetTutorCourses } from "@/hooks/useSupabaseQuery";
import { useUpsertAvailability } from "@/hooks/useAvailability";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { toast } from "@/components/ui/sonner";
import { springs } from "@/lib/motion";

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY = "tutr:onboarding:tutor";
const TOTAL_STEPS = 4;

const MAJORS = [
  "Computer Science", "Business", "Engineering", "Pre-med",
  "Economics", "Architecture", "Biology", "Mathematics",
  "Psychology", "Languages",
];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const GRADES = ["A", "A-", "B+", "B", "B-"] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  "6 PM", "7 PM", "8 PM",
];
const HOURS_24 = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
];

interface Draft {
  step: number;
  selectedUni: string;
  selectedMajor: string;
  selectedYear: string;
  bio: string;
  rate: number;
  mode: "online" | "in-person" | "both";
  selectedCourses: { courseId: string; grade: string }[];
  availability: Record<string, boolean>;
}

const cellKey = (d: number, h: number) => `${d}-${h}`;

// ── Progress bar ─────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="px-5 pt-14 pb-0">
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={springs.smooth}
        />
      </div>
      <p className="text-caption text-ink-muted mt-1.5 text-right">
        Step {step + 1} of {total}
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
const TutorOnboarding = () => {
  const navigate = useNavigate();
  const { setSelectedUniversity } = useUniversity();
  const { user, refreshProfile } = useAuth();
  const { data: universities = [] } = useUniversities();
  const updateProfile = useUpdateProfile();
  const setTutorCourses = useSetTutorCourses();
  const upsertAvailability = useUpsertAvailability();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showSuccess, setShowSuccess] = useState(false);

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: Draft = JSON.parse(raw);
      setStep(Math.min(saved.step ?? 0, TOTAL_STEPS - 1));
      setSelectedUni(saved.selectedUni ?? "");
      setSelectedMajor(saved.selectedMajor ?? "");
      setSelectedYear(saved.selectedYear ?? "");
      setBio(saved.bio ?? "");
      setRate(saved.rate ?? 15);
      setMode(saved.mode ?? "both");
      setSelectedCourses(saved.selectedCourses ?? []);
      setAvailability(saved.availability ?? {});
      if (saved.step > 0) toast("Picking up where you left off");
    } catch { /* ignore */ }
  }, []);

  const persistDraft = useCallback((nextStep: number) => {
    const draft: Draft = {
      step: nextStep,
      selectedUni, selectedMajor, selectedYear,
      bio, rate, mode, selectedCourses, availability,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [selectedUni, selectedMajor, selectedYear, bio, rate, mode, selectedCourses, availability]);

  const goForward = () => {
    const next = step + 1;
    setDirection(1);
    persistDraft(next);
    setStep(next);
  };

  const goBack = () => {
    const prev = step - 1;
    setDirection(-1);
    persistDraft(prev);
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

  const toggleCell = (d: number, h: number) => {
    const key = cellKey(d, h);
    setAvailability(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

      const slots = Object.entries(availability)
        .filter(([, v]) => v)
        .map(([key]) => {
          const [dStr, hStr] = key.split("-");
          const start = HOURS_24[parseInt(hStr, 10)];
          const endHour = parseInt(start.split(":")[0], 10) + 1;
          return {
            tutor_id: user.id,
            day_of_week: parseInt(dStr, 10),
            start_time: start,
            end_time: `${String(endHour).padStart(2, "0")}:00`,
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
      toast("Something went wrong. Please try again.");
    }
  };

  const saving = updateProfile.isPending || setTutorCourses.isPending || upsertAvailability.isPending;

  const canContinue = [
    !!selectedUni && !!selectedMajor && !!selectedYear,
    true,
    selectedCourses.length > 0,
    true,
  ][step] ?? true;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: springs.smooth },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.15 } }),
  };

  return (
    <div className="min-h-svh bg-background flex flex-col overflow-x-hidden">
      <SuccessOverlay
        visible={showSuccess}
        title="Profile ready!"
        description="Students can now find and book you."
        onDismiss={() => navigate("/tutor/requests")}
      />

      <ProgressBar step={step} total={TOTAL_STEPS} />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col"
          >
            {step === 0 && (
              <TStep0
                universities={universities}
                selectedUni={selectedUni}
                selectedMajor={selectedMajor}
                selectedYear={selectedYear}
                onUni={setSelectedUni}
                onMajor={setSelectedMajor}
                onYear={setSelectedYear}
              />
            )}
            {step === 1 && (
              <TStep1
                bio={bio}
                rate={rate}
                mode={mode}
                onBio={setBio}
                onRate={setRate}
                onMode={setMode}
              />
            )}
            {step === 2 && (
              <TStep2
                allCourses={allCourses}
                filteredCourses={filteredCourses}
                selectedCourses={selectedCourses}
                courseSearch={courseSearch}
                selectedUni={selectedUni}
                onSearch={setCourseSearch}
                onToggle={toggleCourse}
                onGrade={setGrade}
              />
            )}
            {step === 3 && (
              <TStep3
                availability={availability}
                onToggle={toggleCell}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="px-5 pb-10 pt-4 space-y-3 bg-background z-10">
        {step > 0 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={springs.snappy}
            onClick={goBack}
            className="flex items-center gap-1.5 text-ink-muted text-body-sm"
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={goForward}
            disabled={!canContinue}
            className="w-full h-14 rounded-2xl bg-accent text-white text-label font-semibold disabled:opacity-40 transition-opacity"
          >
            Continue
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={springs.snappy}
              onClick={finish}
              disabled={saving}
              className="w-full h-14 rounded-2xl bg-accent text-white text-label font-semibold disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Saving…
                </>
              ) : "Start tutoring"}
            </motion.button>
            <p className="text-caption text-ink-muted text-center">
              By continuing you agree to our{" "}
              <Link to="/terms" className="text-accent" target="_blank">Terms</Link>
              {" & "}
              <Link to="/privacy" className="text-accent" target="_blank">Privacy Policy</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ── Step 0: University + Major + Year ────────────────────────
function TStep0({
  universities, selectedUni, selectedMajor, selectedYear,
  onUni, onMajor, onYear,
}: {
  universities: any[];
  selectedUni: string;
  selectedMajor: string;
  selectedYear: string;
  onUni: (v: string) => void;
  onMajor: (v: string) => void;
  onYear: (v: string) => void;
}) {
  return (
    <div className="px-5 pt-8 pb-4 flex-1 overflow-y-auto">
      <p className="text-overline text-accent mb-2">Step 1</p>
      <h1 className="text-h1 font-display mb-1">
        Your <em>university</em>
      </h1>
      <p className="text-body-sm text-ink-muted mb-5">
        We'll match you with students from your school.
      </p>

      <div className="space-y-2.5 mb-6">
        {universities.map(uni => (
          <motion.button
            key={uni.id}
            whileTap={{ scale: 0.98 }}
            transition={springs.snappy}
            onClick={() => onUni(uni.id)}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-colors ${
              selectedUni === uni.id
                ? "border-accent bg-accent-light"
                : "border-border bg-surface"
            }`}
          >
            <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: uni.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-label font-semibold text-foreground">{uni.short_name}</div>
              <div className="text-body-sm text-ink-muted truncate">{uni.name}</div>
            </div>
            {selectedUni === uni.id && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Check size={10} color="white" strokeWidth={2.5} />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <p className="text-label text-ink-muted mb-2">Major</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {MAJORS.map(m => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.95 }}
            transition={springs.snappy}
            onClick={() => onMajor(m)}
            className={`px-3.5 py-2 rounded-full text-label transition-colors ${
              selectedMajor === m
                ? "bg-accent text-white"
                : "bg-surface border border-border text-foreground"
            }`}
          >
            {m}
          </motion.button>
        ))}
      </div>

      <p className="text-label text-ink-muted mb-2">Year</p>
      <select
        value={selectedYear}
        onChange={e => onYear(e.target.value)}
        style={{ fontSize: "16px" }}
        className="w-full p-3.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent transition-colors"
      >
        <option value="">Select your year</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

// ── Step 1: Bio + Rate + Mode ────────────────────────────────
function TStep1({
  bio, rate, mode, onBio, onRate, onMode,
}: {
  bio: string;
  rate: number;
  mode: "online" | "in-person" | "both";
  onBio: (v: string) => void;
  onRate: (v: number) => void;
  onMode: (v: "online" | "in-person" | "both") => void;
}) {
  return (
    <div className="px-5 pt-8 pb-4 flex-1 overflow-y-auto">
      <p className="text-overline text-accent mb-2">Step 2</p>
      <h1 className="text-h1 font-display mb-1">
        Tell students about <em>yourself</em>
      </h1>
      <p className="text-body-sm text-ink-muted mb-5">
        A strong bio gets more bookings.
      </p>

      <p className="text-label text-ink-muted mb-2">Bio</p>
      <textarea
        value={bio}
        onChange={e => onBio(e.target.value)}
        rows={4}
        placeholder="e.g. Senior CS student at AUB. Aced CMPS211 and CMPS303. Love breaking down complex topics."
        style={{ fontSize: "16px" }}
        className="w-full p-4 rounded-xl border border-border bg-surface text-foreground resize-none focus:outline-none focus:border-accent transition-colors mb-1"
        maxLength={300}
      />
      <div className="flex justify-end mb-5">
        <span className="text-caption text-ink-muted">{bio.length}/300</span>
      </div>

      <p className="text-label text-ink-muted mb-2">Hourly rate</p>
      <div className="text-center mb-2">
        <span className="text-display font-display text-foreground">${rate}</span>
        <span className="text-body text-ink-muted">/hr</span>
      </div>
      <input
        type="range"
        min={5}
        max={60}
        step={5}
        value={rate}
        onChange={e => onRate(Number(e.target.value))}
        className="w-full accent-accent mb-1"
      />
      <div className="flex justify-between text-caption text-ink-muted mb-5">
        <span>$5/hr</span>
        <span>$60/hr</span>
      </div>

      <p className="text-label text-ink-muted mb-2">Session mode</p>
      <div className="flex gap-2">
        {(["online", "in-person", "both"] as const).map(m => (
          <button
            key={m}
            onClick={() => onMode(m)}
            className={`flex-1 py-3 rounded-xl text-label capitalize transition-colors border ${
              mode === m
                ? "bg-accent-light border-accent text-accent font-medium"
                : "bg-surface border-border text-ink-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Courses + Grades ─────────────────────────────────
function TStep2({
  allCourses, filteredCourses, selectedCourses, courseSearch,
  selectedUni, onSearch, onToggle, onGrade,
}: {
  allCourses: any[];
  filteredCourses: any[];
  selectedCourses: { courseId: string; grade: string }[];
  courseSearch: string;
  selectedUni: string;
  onSearch: (v: string) => void;
  onToggle: (id: string) => void;
  onGrade: (id: string, g: string) => void;
}) {
  return (
    <div className="px-5 pt-8 pb-4 flex-1 flex flex-col overflow-hidden">
      <p className="text-overline text-accent mb-2">Step 3</p>
      <h1 className="text-h1 font-display mb-1">
        Courses you can <em>teach</em>
      </h1>
      <p className="text-body-sm text-ink-muted mb-4">
        Select courses and the grade you earned.
      </p>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        <input
          value={courseSearch}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search courses…"
          style={{ fontSize: "16px" }}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {selectedCourses.length > 0 && (
        <div className="space-y-2 mb-3">
          {selectedCourses.map(sc => {
            const c = allCourses.find(x => x.id === sc.courseId);
            if (!c) return null;
            return (
              <div key={sc.courseId} className="flex items-center gap-2 bg-accent-light rounded-xl p-3 border border-accent/20">
                <span className="text-label font-medium text-foreground flex-1 truncate">{c.code}</span>
                <div className="flex gap-1">
                  {GRADES.map(g => (
                    <button
                      key={g}
                      onClick={() => onGrade(sc.courseId, g)}
                      className={`text-caption px-2 py-1 rounded-full font-semibold transition-colors ${
                        sc.grade === g
                          ? "bg-accent text-white"
                          : "bg-surface border border-border text-ink-muted"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <button onClick={() => onToggle(sc.courseId)} className="p-1 text-ink-muted hover:text-foreground" aria-label="Remove">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-0.5">
        {filteredCourses
          .filter(c => !selectedCourses.find(sc => sc.courseId === c.id))
          .map(c => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
              onClick={() => onToggle(c.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent-light transition-colors flex items-center gap-3"
            >
              <span className="text-label font-medium text-foreground w-20 flex-shrink-0">{c.code}</span>
              <span className="text-body-sm text-ink-muted truncate">{c.name}</span>
            </motion.button>
          ))}
        {filteredCourses.filter(c => !selectedCourses.find(sc => sc.courseId === c.id)).length === 0 && !selectedCourses.length && (
          <p className="text-body-sm text-ink-muted text-center py-8">
            {selectedUni ? "No courses found." : "Select a university first."}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Step 3: Availability grid ────────────────────────────────
function TStep3({
  availability, onToggle,
}: {
  availability: Record<string, boolean>;
  onToggle: (d: number, h: number) => void;
}) {
  const activeCount = Object.values(availability).filter(Boolean).length;

  return (
    <div className="px-5 pt-8 pb-4 flex-1 flex flex-col overflow-hidden">
      <p className="text-overline text-accent mb-2">Step 4</p>
      <h1 className="text-h1 font-display mb-1">
        Your <em>availability</em>
      </h1>
      <p className="text-body-sm text-ink-muted mb-4">
        Tap to mark when you're free. You can update anytime.
      </p>

      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[380px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-1 mb-1.5 pl-14">
            {DAYS.map(d => (
              <div key={d} className="text-caption font-semibold text-ink-muted text-center">
                {d.charAt(0)}
              </div>
            ))}
          </div>

          {/* Time rows */}
          <div className="space-y-1">
            {HOURS.map((label, hi) => (
              <div key={hi} className="grid grid-cols-8 gap-1 items-center">
                <div className="text-caption text-ink-muted col-span-1 text-right pr-2 w-14 flex-shrink-0">
                  {label}
                </div>
                {DAYS.map((_, di) => {
                  const active = !!availability[cellKey(di, hi)];
                  return (
                    <motion.button
                      key={di}
                      whileTap={{ scale: 0.9 }}
                      transition={springs.snappy}
                      onClick={() => onToggle(di, hi)}
                      className={`h-7 rounded-md border transition-colors ${
                        active
                          ? "bg-accent-light border-accent"
                          : "bg-surface border-border"
                      }`}
                      aria-label={`${DAYS[di]} ${label}`}
                      aria-pressed={active}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-caption text-ink-muted text-center mt-3">
        {activeCount} slot{activeCount !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}

export default TutorOnboarding;
