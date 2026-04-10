import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, BadgeCheck, Clock, MessageCircle, Video, MapPin } from "lucide-react";
import { getTutor } from "@/data/tutors";
import { courses } from "@/data/courses";
import { getReviewsByTutor } from "@/data/reviews";
import { getUniversity } from "@/data/universities";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mockSlots = [
  { day: "Mon", times: ["10:00", "14:00", "16:00"] },
  { day: "Tue", times: ["09:00", "11:00"] },
  { day: "Wed", times: ["14:00", "15:00", "17:00"] },
  { day: "Thu", times: ["10:00"] },
  { day: "Fri", times: ["09:00", "11:00", "14:00", "16:00"] },
  { day: "Sat", times: ["10:00", "12:00"] },
  { day: "Sun", times: [] },
];

const TutorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tutor = getTutor(id || "");
  const uni = tutor ? getUniversity(tutor.universityId) : null;
  const tutorReviews = tutor ? getReviewsByTutor(tutor.id) : [];
  const [showBookBar, setShowBookBar] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBookBar(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!tutor || !uni) return null;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="mb-6 p-2 -ml-2 rounded-xl hover:bg-muted" aria-label="Back">
          <ArrowLeft size={22} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <img src={tutor.avatarUrl} alt={tutor.name} className="w-24 h-24 rounded-full object-cover mb-3" />
          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="font-display text-2xl font-medium">{tutor.name}</h1>
            {tutor.verified && <BadgeCheck size={18} className="text-accent" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-ink">
            <span className="px-2 py-0.5 rounded-pill text-xs font-medium" style={{ backgroundColor: uni.color + "15", color: uni.color }}>{uni.shortName}</span>
            <span>{tutor.major}, {tutor.year}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around bg-surface rounded-xl border border-hairline p-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star size={14} className="text-accent fill-accent" />
              <span className="font-display font-medium text-lg">{tutor.rating}</span>
            </div>
            <span className="text-xs text-muted-ink">{tutor.reviewCount} reviews</span>
          </div>
          <div className="w-px h-8 bg-hairline" />
          <div className="text-center">
            <div className="font-display font-medium text-lg mb-0.5">{tutor.sessionsCompleted}</div>
            <span className="text-xs text-muted-ink">sessions</span>
          </div>
          <div className="w-px h-8 bg-hairline" />
          <div className="text-center">
            <div className="font-display font-medium text-lg mb-0.5">{tutor.responseTime}</div>
            <span className="text-xs text-muted-ink">response</span>
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h2 className="font-display text-base font-medium mb-2">About</h2>
          <p className="text-sm text-muted-ink leading-relaxed">{tutor.bio}</p>
        </div>

        {/* Courses */}
        <div className="mb-6">
          <h2 className="font-display text-base font-medium mb-2">Courses I teach</h2>
          <div className="flex flex-wrap gap-2">
            {tutor.coursesTaught.map(ct => {
              const c = courses.find(x => x.id === ct.courseId);
              return c ? (
                <span key={ct.courseId} className="text-xs px-2.5 py-1 rounded-pill bg-muted font-medium">
                  {c.code} · {ct.grade}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <h2 className="font-display text-base font-medium mb-3">Availability</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {mockSlots.map(day => (
              <div key={day.day} className="flex-shrink-0 w-16 text-center">
                <div className="text-xs font-medium text-muted-ink mb-2">{day.day}</div>
                <div className="space-y-1">
                  {day.times.length > 0 ? day.times.map(t => (
                    <div key={t} className="text-xs py-1 px-1.5 rounded-md bg-accent-soft text-accent font-medium">{t}</div>
                  )) : (
                    <div className="text-xs py-1 text-muted-ink">—</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-6">
          <h2 className="font-display text-base font-medium mb-3">Reviews</h2>
          <div className="space-y-3">
            {tutorReviews.slice(0, 3).map(review => (
              <div key={review.id} className="bg-surface rounded-xl border border-hairline p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src={review.studentAvatar} alt={review.studentName} className="w-7 h-7 rounded-full" />
                  <span className="text-sm font-medium">{review.studentName}</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={11} className="text-accent fill-accent" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-ink leading-relaxed">{review.comment}</p>
                <div className="text-xs text-muted-ink mt-2">{new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              </div>
            ))}
          </div>
          {tutorReviews.length > 3 && (
            <button className="text-sm text-accent font-medium mt-3">See all {tutor.reviewCount} reviews</button>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <h2 className="font-display text-base font-medium mb-3">Pricing</h2>
          <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><Video size={16} className="text-muted-ink" /><span className="text-sm">1-on-1 · 60 min</span></div>
              <span className="font-display font-medium">${tutor.hourlyRate}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><MessageCircle size={16} className="text-muted-ink" /><span className="text-sm">Group (2–4) · 60 min</span></div>
              <span className="font-display font-medium">${Math.round(tutor.hourlyRate * 0.67)}<span className="text-xs text-muted-ink font-body">/person</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky book CTA */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto bg-surface border-t border-hairline px-5 py-4 transition-transform duration-300 ${showBookBar ? "translate-y-0" : "translate-y-full"}`}>
        {booked ? (
          <div className="text-center py-2">
            <span className="text-success font-medium">✓ Session request sent!</span>
          </div>
        ) : (
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setBooked(true)}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base">
            Book a session · ${tutor.hourlyRate}/hr
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default TutorProfile;
