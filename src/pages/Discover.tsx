// ============================================================
// Tutr — Discover Page (personalized home feed)
// ============================================================
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MessageCircle,
  Loader2,
  BookOpen,
  Calculator,
  Sparkles,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Avatar } from "@/components/Avatar";
import { useUniversity } from "@/contexts/UniversityContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useUniversities,
  useCourses,
  useTutors,
} from "@/hooks/useSupabaseQuery";
import { useStudentCourses, useTutorsForStudentCourses } from "@/hooks/useStudentCourses";
import { supabase } from "@/lib/supabase";
import {
  isMissingSupabaseResourceError,
  isSupabaseResourceMissing,
  markSupabaseResourceMissing,
} from "@/lib/supabaseResourceFallback";

import { TutorCard } from "@/components/TutorCard";
import { UniversityPill } from "@/components/UniversityPill";
import { UniversitySwitcher } from "@/components/UniversitySwitcher";
import { TutorCardSkeleton } from "@/components/skeletons/TutorCardSkeleton";
import { CourseCardSkeleton } from "@/components/skeletons/CourseCardSkeleton";
import { SkeletonList } from "@/components/skeletons/Skeleton";
import { useConversations, useConversationsRealtime } from "@/hooks/useMessages";

import { variants } from "@/lib/motion";
import type { Profile } from "@/types/database";

// ── Greeting helper ───────────────────────────────────────────
function getGreeting(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}


// ── Trending tutors hook ──────────────────────────────────────
function useTrendingTutors(universityId: string) {
  return useQuery({
    queryKey: ["trending-tutors", universityId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("trending_tutors")) {
        return [] as Profile[];
      }

      const { data, error } = await supabase
        .from("trending_tutors" as never)
        .select(`
          *,
          tutor_stats (*),
          tutor_courses (*, course:courses(*))
        `)
        .eq("university_id", universityId)
        .limit(5);
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("trending_tutors");
          return [] as Profile[];
        }
        return [] as Profile[];
      }
      return (data ?? []) as Profile[];
    },
    enabled: !!universityId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── New tutors hook ───────────────────────────────────────────
function useNewTutors(universityId: string) {
  return useQuery({
    queryKey: ["new-tutors", universityId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          tutor_stats (*),
          tutor_courses (*, course:courses(*))
        `)
        .eq("role", "tutor")
        .eq("university_id", universityId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
    enabled: !!universityId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Section wrapper component ─────────────────────────────────
interface SectionProps {
  title: string;
  overline?: string;
  children: React.ReactNode;
}

function Section({ title, overline, children }: SectionProps) {
  return (
    <motion.div
      variants={variants.staggerChildren}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      {overline && (
        <motion.p variants={variants.staggerItem} className="text-overline text-ink-muted mb-1">
          {overline}
        </motion.p>
      )}
      <motion.h2 variants={variants.staggerItem} className="text-h2 mb-3">
        {title}
      </motion.h2>
      {children}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────
const DiscoverPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedUniversity } = useUniversity();
  const { profile } = useAuth();

  const [uniSwitcherOpen, setUniSwitcherOpen] = useState(false);

  // Pull-to-refresh state
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const PULL_THRESHOLD = 72;

  // ── Data hooks ────────────────────────────────────────────
  const { data: universities = [] } = useUniversities();
  const {
    data: uniCourses = [],
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useCourses(selectedUniversity);
  const {
    data: allTutors = [],
    isLoading: tutorsLoading,
    refetch: refetchTutors,
  } = useTutors(selectedUniversity);

  // Student-specific data
  const studentId = profile?.id ?? "";
  const { data: conversations = [] } = useConversations(studentId);
  const hasUnreadMessages = conversations.some(
    (conversation: any) => (conversation.unreadCount ?? 0) > 0,
  );
  const { subscribe: subscribeMessages } = useConversationsRealtime(studentId);
  useEffect(() => subscribeMessages(), [studentId]);
  const { data: studentCourses = [], isLoading: studentCoursesLoading } = useStudentCourses(studentId);
  const hasEnrolledCourses = studentCourses.length > 0;
  const {
    data: tutorsForCourses = [],
    isLoading: tutorsForCoursesLoading,
  } = useTutorsForStudentCourses(studentId, selectedUniversity);

  // Trending / new tutors
  const { data: trendingTutors = [] } = useTrendingTutors(selectedUniversity);
  const { data: newTutors = [] } = useNewTutors(selectedUniversity);

  const uni = universities.find((u) => u.id === selectedUniversity);

  // Top-rated: sort all tutors by rating desc, take top 5
  const topTutors = [...allTutors]
    .sort((a, b) => (b.tutor_stats?.rating ?? 0) - (a.tutor_stats?.rating ?? 0))
    .slice(0, 5);

  const timeOfDay = getGreeting();

  // ── Pull-to-refresh handlers ──────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (touchStartY.current === null || isRefreshing) return;
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta * 0.5, PULL_THRESHOLD + 20));
      }
    },
    [isRefreshing],
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await Promise.all([refetchTutors(), refetchCourses()]);
        await queryClient.invalidateQueries({ queryKey: ["trending-tutors", selectedUniversity] });
        await queryClient.invalidateQueries({ queryKey: ["new-tutors", selectedUniversity] });
        await queryClient.invalidateQueries({ queryKey: ["tutors-for-courses", studentId] });
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
    touchStartY.current = null;
  }, [pullDistance, isRefreshing, refetchTutors, refetchCourses, queryClient, selectedUniversity, studentId]);

  // Reset pull distance when refresh completes
  useEffect(() => {
    if (!isRefreshing) setPullDistance(0);
  }, [isRefreshing]);

  return (
    <>
      {/* ── Pull-to-refresh spinner ─────────────────────────── */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 max-w-[440px] mx-auto pointer-events-none"
          >
            <div
              className="w-9 h-9 rounded-full bg-surface shadow-float flex items-center justify-center"
              style={{ opacity: Math.min(pullDistance / PULL_THRESHOLD, 1) }}
            >
              <Loader2
                size={18}
                className={`text-accent ${isRefreshing ? "animate-spin" : ""}`}
                style={
                  !isRefreshing
                    ? { transform: `rotate(${(pullDistance / PULL_THRESHOLD) * 360}deg)` }
                    : undefined
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scrollable container ───────────────────────────── */}
      <div
        ref={scrollRef}
        className="overflow-y-auto h-full pb-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          paddingTop: isRefreshing ? 48 : undefined,
          transition: "padding-top 0.2s",
        }}
      >
        <div className="px-5 pt-14">

          {/* ── 1. Greeting header ──────────────────────────── */}
          <motion.div
            variants={variants.fadeSlideDown}
            initial="hidden"
            animate="visible"
            className="flex items-start justify-between mb-1"
          >
            <div className="flex-1 min-w-0">
              <h1 className="text-display leading-tight">
                Good {timeOfDay},{" "}
                <em style={{ fontStyle: "italic" }}>
                  {profile?.full_name?.split(" ")[0] ?? "there"}
                </em>
              </h1>
              {uni?.short_name && (
                <p className="text-caption text-ink-muted mt-1">
                  240+ tutors at {uni.short_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3 mt-1">
              {/* Messages button with unread dot */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  aria-label="Open messages"
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-surface transition-colors hover:border-accent/35 hover:text-accent"
                >
                  <MessageCircle size={18} className="text-ink-muted" />
                </button>
                {hasUnreadMessages && (
                  <span
                    className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-accent"
                    style={{ boxShadow: "0 0 0 2px var(--bg-primary)" }}
                    aria-hidden="true"
                  />
                )}
              </div>
              {/* Avatar */}
              <button
                type="button"
                onClick={() => navigate(profile?.role === "tutor" ? "/tutor/profile" : "/profile")}
                aria-label="Open profile"
                className="rounded-full flex-shrink-0 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name ?? "Profile"}
                  size={40}
                  className="border border-border"
                />
              </button>
            </div>
          </motion.div>

          {/* ── 2. University pill ──────────────────────────── */}
          <motion.div
            variants={variants.fadeIn}
            initial="hidden"
            animate="visible"
            className="mb-4 mt-3"
          >
            <UniversityPill onClick={() => setUniSwitcherOpen(true)} />
          </motion.div>

          {/* ── 3. Search bar ───────────────────────────────── */}
          <motion.button
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/search")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border border-border bg-surface mb-6 text-left"
            aria-label="Open search"
          >
            <Search size={18} className="text-ink-subtle flex-shrink-0" />
            <span className="text-body-sm text-ink-subtle">Search courses, tutors…</span>
          </motion.button>

          {/* ── 4. Contextual hero card ─────────────────────── */}
          <motion.div
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/search")}
              className="w-full bg-surface rounded-xl border border-border p-5 text-left flex items-center gap-4 transition-shadow hover:shadow-[0_0_0_2px_hsl(152_60%_42%_/_0.15)]"
              aria-label="Find a tutor"
            >
              {/* Icon circle */}
              <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                <Sparkles size={24} className="text-accent" />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-label leading-snug mb-0.5">
                  Your next session starts here.
                </p>
                <p className="text-body-sm text-ink-muted">
                  Browse top-rated tutors at your university.
                </p>
              </div>
              {/* CTA */}
              <span className="text-body-sm font-medium text-accent flex-shrink-0">
                Find a tutor
              </span>
            </motion.button>
          </motion.div>

          {/* ── 5. Tutors for your courses ──────────────────── */}
          {(hasEnrolledCourses || studentCoursesLoading || tutorsForCoursesLoading) && (
            <Section title="Tutors for your courses" overline="FOR YOU">
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                {tutorsForCoursesLoading ? (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        variants={variants.staggerItem}
                        className="flex-shrink-0 w-[280px]"
                      >
                        <TutorCardSkeleton />
                      </motion.div>
                    ))}
                  </>
                ) : tutorsForCourses.length > 0 ? (
                  tutorsForCourses.map((tutor) => (
                    <motion.div
                      key={tutor.id}
                      variants={variants.staggerItem}
                      className="flex-shrink-0 w-[280px]"
                    >
                      <TutorCard tutor={tutor as Parameters<typeof TutorCard>[0]["tutor"]} />
                    </motion.div>
                  ))
                ) : (
                  <motion.p variants={variants.staggerItem} className="text-body-sm text-ink-muted py-2">
                    No tutors found for your enrolled courses yet.
                  </motion.p>
                )}
              </div>
            </Section>
          )}

          {/* ── 6. Top-rated at [uni] ───────────────────────── */}
          <Section
            title={`Top-rated at ${uni?.short_name ?? "your university"}`}
            overline="TOP RATED"
          >
            {tutorsLoading ? (
              <div className="space-y-3">
                <SkeletonList count={4} component={TutorCardSkeleton} />
              </div>
            ) : topTutors.length > 0 ? (
              <div className="space-y-3">
                {topTutors.map((tutor) => (
                  <motion.div key={tutor.id} variants={variants.staggerItem}>
                    <TutorCard tutor={tutor as Parameters<typeof TutorCard>[0]["tutor"]} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p variants={variants.staggerItem} className="text-body-sm text-ink-muted py-2">
                No tutors at {uni?.short_name ?? "your university"} yet.
              </motion.p>
            )}
          </Section>

          {/* ── 7. Trending this week ────────────────────────── */}
          {trendingTutors.length > 0 && (
            <Section title="Trending this week" overline="TRENDING">
              <div className="space-y-3">
                {trendingTutors.map((tutor) => (
                  <motion.div key={tutor.id} variants={variants.staggerItem}>
                    <TutorCard tutor={tutor as Parameters<typeof TutorCard>[0]["tutor"]} />
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* ── 8. New tutors at [uni] ──────────────────────── */}
          {newTutors.length > 0 && (
            <Section title={`New tutors at ${uni?.short_name ?? "your university"}`} overline="NEW">
              <div className="space-y-3">
                {newTutors.map((tutor) => (
                  <motion.div key={tutor.id} variants={variants.staggerItem}>
                    <TutorCard tutor={tutor as Parameters<typeof TutorCard>[0]["tutor"]} />
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* ── 9. Popular courses ──────────────────────────── */}
          <Section title="Popular courses" overline="BROWSE">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {coursesLoading ? (
                <>
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div key={i} variants={variants.staggerItem} className="flex-shrink-0">
                      <CourseCardSkeleton />
                    </motion.div>
                  ))}
                </>
              ) : uniCourses.length > 0 ? (
                uniCourses.slice(0, 8).map((course) => (
                  <motion.button
                    key={course.id}
                    variants={variants.staggerItem}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="flex-shrink-0 w-[140px] bg-surface rounded-xl border border-border p-3.5 text-left"
                    aria-label={`${course.code} — ${course.name}`}
                  >
                    {/* Uni-color accent bar */}
                    <div
                      className="w-full h-1 rounded-full mb-3"
                      style={{ backgroundColor: uni?.color ?? "hsl(152 60% 42%)" }}
                    />
                    <div className="text-display-sm mb-0.5 truncate">{course.code}</div>
                    <div className="text-body-sm text-ink-muted line-clamp-2 leading-snug">
                      {course.name}
                    </div>
                  </motion.button>
                ))
              ) : (
                <motion.p variants={variants.staggerItem} className="text-body-sm text-ink-muted py-2">
                  No courses found.
                </motion.p>
              )}
            </div>
          </Section>

        </div>
      </div>

      {/* ── University switcher sheet ────────────────────── */}
      <UniversitySwitcher
        open={uniSwitcherOpen}
        onClose={() => setUniSwitcherOpen(false)}
      />

    </>
  );
};

export default DiscoverPage;
