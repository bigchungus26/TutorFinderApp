import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUniversity } from "@/contexts/UniversityContext";
import { useRole } from "@/contexts/RoleContext";
import { universities } from "@/data/universities";
import { ChevronRight } from "lucide-react";

const majors = ["Computer Science", "Business", "Engineering", "Pre-med", "Economics", "Architecture", "Biology", "Mathematics", "Psychology", "Languages"];
const years = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { setSelectedUniversity } = useUniversity();
  const { setRole, setHasOnboarded } = useRole();
  const [step, setStep] = useState(0);
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");

  const toggleMajor = (m: string) => {
    setSelectedMajors(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const finish = () => {
    setSelectedUniversity(selectedUni || "aub");
    setRole("student");
    setHasOnboarded(true);
    navigate("/");
  };

  const slides = [
    // Screen 1
    <div key="s1" className="flex flex-col items-center text-center px-6 pt-20 pb-8 flex-1">
      <div className="w-40 h-40 rounded-full bg-accent-soft mb-10 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-accent/20" />
      </div>
      <h1 className="font-display text-[26px] leading-tight font-medium mb-3">Find tutors who aced your exact course.</h1>
      <p className="text-muted-ink text-base">Real students. Real grades. Real results.</p>
    </div>,
    // Screen 2 — University picker
    <div key="s2" className="px-6 pt-12 pb-8 flex-1">
      <h1 className="font-display text-[26px] leading-tight font-medium mb-2">Pick your university.</h1>
      <p className="text-muted-ink text-base mb-8">We'll show you tutors and courses at your school.</p>
      <div className="space-y-3">
        {universities.map(uni => (
          <motion.button
            key={uni.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedUni(uni.id)}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-colors ${
              selectedUni === uni.id ? "border-accent bg-accent-soft" : "border-hairline bg-surface"
            }`}
          >
            <div className="w-1 h-10 rounded-full" style={{ backgroundColor: uni.color }} />
            <div className="flex-1">
              <div className="font-display font-medium text-base">{uni.shortName}</div>
              <div className="text-sm text-muted-ink">{uni.name}</div>
            </div>
            <div className="text-xs text-muted-ink">{uni.tutorCount}+ tutors</div>
          </motion.button>
        ))}
      </div>
    </div>,
    // Screen 3 — Majors
    <div key="s3" className="px-6 pt-12 pb-8 flex-1">
      <h1 className="font-display text-[26px] leading-tight font-medium mb-2">What are you studying?</h1>
      <p className="text-muted-ink text-base mb-6">Pick your area of focus. You can change this later.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {majors.map(m => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.96 }}
            onClick={() => toggleMajor(m)}
            className={`px-4 py-2.5 rounded-pill text-sm font-medium transition-colors ${
              selectedMajors.includes(m) ? "bg-accent text-accent-foreground" : "bg-surface border border-hairline text-foreground"
            }`}
          >
            {m}
          </motion.button>
        ))}
      </div>
      <div className="mb-4">
        <label className="text-sm font-medium text-muted-ink mb-2 block">Year</label>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="w-full p-3.5 rounded-lg border border-hairline bg-surface text-foreground font-body"
        >
          <option value="">Select your year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-6 pb-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-accent" : "w-1.5 bg-hairline"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          {slides[step]}
        </motion.div>
      </AnimatePresence>

      <div className="px-6 pb-8">
        {step < 2 ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !selectedUni}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base disabled:opacity-40"
          >
            Continue
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={finish}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base"
          >
            Get started
          </motion.button>
        )}
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full mt-3 text-sm text-muted-ink">
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentOnboarding;
