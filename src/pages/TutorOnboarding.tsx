import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUniversity } from "@/contexts/UniversityContext";
import { useRole } from "@/contexts/RoleContext";
import { universities } from "@/data/universities";
import { courses } from "@/data/courses";
import { Search, X } from "lucide-react";

const grades = ["A", "A-", "B+", "B", "B-"];

const TutorOnboarding = () => {
  const navigate = useNavigate();
  const { setSelectedUniversity } = useUniversity();
  const { setRole, setHasOnboarded } = useRole();
  const [step, setStep] = useState(0);
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<{ courseId: string; grade: string }[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [rate, setRate] = useState(15);
  const [bio, setBio] = useState("");

  const uniCourses = courses.filter(c => c.universityId === selectedUni);
  const filteredCourses = uniCourses.filter(c =>
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.find(sc => sc.courseId === courseId)) {
      setSelectedCourses(prev => prev.filter(sc => sc.courseId !== courseId));
    } else {
      setSelectedCourses(prev => [...prev, { courseId, grade: "A" }]);
    }
  };

  const setGrade = (courseId: string, grade: string) => {
    setSelectedCourses(prev => prev.map(sc => sc.courseId === courseId ? { ...sc, grade } : sc));
  };

  const finish = () => {
    setSelectedUniversity(selectedUni || "aub");
    setRole("tutor");
    setHasOnboarded(true);
    navigate("/tutor/requests");
  };

  const slides = [
    <div key="t1" className="flex flex-col items-center text-center px-6 pt-20 pb-8 flex-1">
      <div className="w-40 h-40 rounded-full bg-accent-soft mb-10 flex items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-accent/20 rotate-12" />
      </div>
      <h1 className="font-display text-[26px] leading-tight font-medium mb-3">Teach what you've mastered.</h1>
      <p className="text-muted-ink text-base">Help fellow students succeed and earn on your own schedule.</p>
    </div>,
    <div key="t2" className="px-6 pt-12 pb-8 flex-1">
      <h1 className="font-display text-[26px] leading-tight font-medium mb-2">Your university</h1>
      <p className="text-muted-ink text-base mb-8">We'll match you with students from your school.</p>
      <div className="space-y-3">
        {universities.map(uni => (
          <motion.button key={uni.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedUni(uni.id)}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-colors ${selectedUni === uni.id ? "border-accent bg-accent-soft" : "border-hairline bg-surface"}`}>
            <div className="w-1 h-10 rounded-full" style={{ backgroundColor: uni.color }} />
            <div className="flex-1">
              <div className="font-display font-medium text-base">{uni.shortName}</div>
              <div className="text-sm text-muted-ink">{uni.name}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>,
    <div key="t3" className="px-6 pt-12 pb-8 flex-1 overflow-auto">
      <h1 className="font-display text-[26px] leading-tight font-medium mb-2">Courses you can teach</h1>
      <p className="text-muted-ink text-base mb-4">Select courses and the grade you got.</p>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-ink" />
        <input value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder="Search courses…"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-hairline bg-surface font-body text-sm" />
      </div>
      {selectedCourses.length > 0 && (
        <div className="mb-4 space-y-2">
          {selectedCourses.map(sc => {
            const c = courses.find(x => x.id === sc.courseId)!;
            return (
              <div key={sc.courseId} className="flex items-center gap-2 bg-accent-soft rounded-lg p-3">
                <span className="text-sm font-medium flex-1">{c.code}</span>
                <div className="flex gap-1">
                  {grades.map(g => (
                    <button key={g} onClick={() => setGrade(sc.courseId, g)}
                      className={`text-xs px-2 py-1 rounded-pill font-medium ${sc.grade === g ? "bg-accent text-accent-foreground" : "bg-surface border border-hairline"}`}>
                      {g}
                    </button>
                  ))}
                </div>
                <button onClick={() => toggleCourse(sc.courseId)} className="p-1"><X size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
      <div className="space-y-1 max-h-52 overflow-auto">
        {filteredCourses.filter(c => !selectedCourses.find(sc => sc.courseId === c.id)).map(c => (
          <motion.button key={c.id} whileTap={{ scale: 0.98 }} onClick={() => toggleCourse(c.id)}
            className="w-full text-left p-3 rounded-lg hover:bg-muted flex items-center gap-3">
            <span className="text-sm font-medium">{c.code}</span>
            <span className="text-sm text-muted-ink">{c.name}</span>
          </motion.button>
        ))}
      </div>
    </div>,
    <div key="t4" className="px-6 pt-12 pb-8 flex-1">
      <h1 className="font-display text-[26px] leading-tight font-medium mb-2">Set your rate</h1>
      <p className="text-muted-ink text-base mb-8">You can adjust this anytime.</p>
      <div className="text-center mb-6">
        <span className="font-display text-5xl font-medium">${rate}</span>
        <span className="text-muted-ink text-lg">/hr</span>
      </div>
      <input type="range" min={5} max={50} value={rate} onChange={e => setRate(Number(e.target.value))}
        className="w-full mb-8 accent-accent" />
      <div className="flex justify-between text-xs text-muted-ink mb-8">
        <span>$5</span><span>$50</span>
      </div>
      <label className="text-sm font-medium text-muted-ink mb-2 block">Short bio</label>
      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
        placeholder="Tell students what makes your sessions great…"
        className="w-full p-3.5 rounded-lg border border-hairline bg-surface font-body text-sm resize-none" />
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="flex justify-center gap-2 pt-6 pb-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-accent" : "w-1.5 bg-hairline"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: "easeOut" }} className="flex-1 flex flex-col">
          {slides[step]}
        </motion.div>
      </AnimatePresence>
      <div className="px-6 pb-8">
        {step < 3 ? (
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(step + 1)}
            disabled={(step === 1 && !selectedUni) || (step === 2 && selectedCourses.length === 0)}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base disabled:opacity-40">
            Continue
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.98 }} onClick={finish}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base">
            Start tutoring
          </motion.button>
        )}
        {step > 0 && <button onClick={() => setStep(step - 1)} className="w-full mt-3 text-sm text-muted-ink">Back</button>}
      </div>
    </div>
  );
};

export default TutorOnboarding;
