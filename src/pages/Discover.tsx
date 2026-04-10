import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Code, FlaskConical, Calculator, DollarSign, Languages, Brain, Cpu, PenTool } from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { getCoursesByUniversity, getSubjects } from "@/data/courses";
import { getTutorsByUniversity } from "@/data/tutors";
import { getUniversity } from "@/data/universities";
import { TutorCard } from "@/components/TutorCard";
import { UniversityPill } from "@/components/UniversityPill";
import { UniversitySwitcher } from "@/components/UniversitySwitcher";

const subjectIcons: Record<string, any> = {
  "Computer Science": Code, "Mathematics": Calculator, "Biology": FlaskConical, "Chemistry": FlaskConical,
  "Economics": DollarSign, "Languages": Languages, "Psychology": Brain, "Engineering": Cpu,
  "Architecture": PenTool, "Business": BookOpen, "Physics": Calculator, "Humanities": BookOpen,
};

const DiscoverPage = () => {
  const navigate = useNavigate();
  const { selectedUniversity } = useUniversity();
  const [uniSwitcherOpen, setUniSwitcherOpen] = useState(false);
  const uni = getUniversity(selectedUniversity);
  const uniCourses = getCoursesByUniversity(selectedUniversity);
  const uniTutors = getTutorsByUniversity(selectedUniversity).sort((a, b) => b.rating - a.rating).slice(0, 5);
  const subjects = getSubjects(selectedUniversity);

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "evening";
  };

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-[22px] font-medium">Good {getHour()}, Andrew</h1>
        </div>
        <img src="https://i.pravatar.cc/100?img=68" alt="Profile" className="w-10 h-10 rounded-full" />
      </div>

      <div className="mb-5">
        <UniversityPill onClick={() => setUniSwitcherOpen(true)} />
      </div>

      {/* Search bar */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/search")}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border border-hairline bg-surface mb-8"
      >
        <Search size={18} className="text-muted-ink" />
        <span className="text-sm text-muted-ink">Search courses, tutors, or codes…</span>
      </motion.button>

      {/* Popular courses */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-medium mb-3">Popular courses at {uni?.shortName}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {uniCourses.slice(0, 8).map(course => (
            <motion.button
              key={course.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/course/${course.id}`)}
              className="flex-shrink-0 w-[140px] bg-surface rounded-xl border border-hairline p-3.5"
            >
              <div className="w-full h-1 rounded-full mb-3" style={{ backgroundColor: uni?.color }} />
              <div className="font-display font-medium text-sm mb-0.5">{course.code}</div>
              <div className="text-xs text-muted-ink line-clamp-2">{course.name}</div>
              <div className="text-xs text-muted-ink mt-2">{course.tutorCount} tutors</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Top-rated tutors */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-medium mb-3">Top-rated tutors</h2>
        <div className="space-y-3">
          {uniTutors.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)}
        </div>
      </div>

      {/* Browse by subject */}
      <div className="mb-4">
        <h2 className="font-display text-lg font-medium mb-3">Browse by subject</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {subjects.map(subject => {
            const Icon = subjectIcons[subject] || BookOpen;
            return (
              <motion.button
                key={subject}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/search?subject=${encodeURIComponent(subject)}`)}
                className="bg-surface rounded-xl border border-hairline p-4 flex items-center gap-3 text-left"
              >
                <Icon size={20} className="text-muted-ink flex-shrink-0" />
                <span className="text-sm font-medium">{subject}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <UniversitySwitcher open={uniSwitcherOpen} onClose={() => setUniSwitcherOpen(false)} />
    </div>
  );
};

export default DiscoverPage;
