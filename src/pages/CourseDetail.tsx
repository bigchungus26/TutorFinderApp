import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users } from "lucide-react";
import { useCourse, useTutorsByCourse, useUniversities } from "@/hooks/useSupabaseQuery";
import { TutorCard } from "@/components/TutorCard";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tutors" | "about">("tutors");
  const { data: course, isLoading: courseLoading } = useCourse(id || "");
  const { data: universities = [] } = useUniversities();
  const { data: courseTutorData = [] } = useTutorsByCourse(id || "");

  const uni = universities.find(u => u.id === course?.university_id);

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !uni) return null;

  // Extract tutor profiles from the joined data
  const courseTutors = courseTutorData
    .map((ct: any) => ct.tutor)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 -ml-2 rounded-xl hover:bg-muted" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: uni.color }} />
        <h1 className="text-display-xl mb-1">{course.code}</h1>
        <p className="text-lg text-muted-ink mb-2">{course.name}</p>
        <p className="text-sm text-muted-ink leading-relaxed mb-4">{course.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-ink">
          <Users size={15} />
          <span>{courseTutors.length} tutors available</span>
        </div>
      </div>

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
            {courseTutors.length > 0 ? courseTutors.map((t: any) => <TutorCard key={t.id} tutor={t} />) : (
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
              <div className="flex justify-between"><span className="text-sm text-muted-ink">Typical semester</span><span className="text-sm font-medium">{course.typical_semester}</span></div>
              <div className="border-t border-hairline" />
              <div className="flex justify-between"><span className="text-sm text-muted-ink">Prerequisites</span><span className="text-sm font-medium">{course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "None"}</span></div>
              <div className="border-t border-hairline" />
              <div className="flex justify-between"><span className="text-sm text-muted-ink">University</span><span className="text-sm font-medium">{uni.short_name}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
