import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users } from "lucide-react";
import { getCourse } from "@/data/courses";
import { getTutorsByCourse } from "@/data/tutors";
import { getUniversity } from "@/data/universities";
import { TutorCard } from "@/components/TutorCard";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tutors" | "about">("tutors");
  const course = getCourse(id || "");
  const uni = course ? getUniversity(course.universityId) : null;
  const courseTutors = course ? getTutorsByCourse(course.id) : [];

  if (!course || !uni) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="px-5 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 -ml-2 rounded-xl hover:bg-muted" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: uni.color }} />
        <h1 className="font-display text-[32px] font-medium leading-tight mb-1">{course.code}</h1>
        <p className="text-lg text-muted-ink mb-2">{course.name}</p>
        <p className="text-sm text-muted-ink leading-relaxed mb-4">{course.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-ink">
          <Users size={15} />
          <span>{courseTutors.length} tutors available</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 mb-4">
        {(["tutors", "about"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-pill text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-foreground text-background" : "text-muted-ink"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="px-5 pb-28">
        {activeTab === "tutors" && (
          <div className="space-y-3">
            {courseTutors.length > 0 ? courseTutors.map(t => <TutorCard key={t.id} tutor={t} />) : (
              <div className="text-center py-12">
                <p className="text-muted-ink">No tutors for this course yet.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "about" && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-hairline p-4 space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-ink">Credits</span><span className="text-sm font-medium">{course.credits}</span></div>
              <div className="border-t border-hairline" />
              <div className="flex justify-between"><span className="text-sm text-muted-ink">Typical semester</span><span className="text-sm font-medium">{course.typicalSemester}</span></div>
              <div className="border-t border-hairline" />
              <div className="flex justify-between"><span className="text-sm text-muted-ink">Prerequisites</span><span className="text-sm font-medium">{course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "None"}</span></div>
              <div className="border-t border-hairline" />
              <div className="flex justify-between"><span className="text-sm text-muted-ink">University</span><span className="text-sm font-medium">{uni.shortName}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
