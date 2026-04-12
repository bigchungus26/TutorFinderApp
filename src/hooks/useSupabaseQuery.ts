// ============================================================
// Tutr — Supabase Data Access Hooks
// These hooks wrap Supabase queries with React Query for
// caching, loading states, and error handling.
//
// Usage: Replace mock data imports with these hooks when
// Supabase is connected. Each hook returns { data, isLoading, error }.
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import { toast, toastError } from "@/components/ui/sonner";
import {
  clearSupabaseResourceMissing,
  isMissingSupabaseResourceError,
  isSupabaseResourceMissing,
  markSupabaseResourceMissing,
} from "@/lib/supabaseResourceFallback";

// ============================================================
// UNIVERSITIES
// ============================================================
export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("short_name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour — rarely changes
  });
}

// ============================================================
// COURSES
// ============================================================
export function useCourses(universityId?: string) {
  return useQuery({
    queryKey: ["courses", universityId],
    queryFn: async () => {
      let query = supabase.from("courses").select("*").order("code");
      if (universityId) query = query.eq("university_id", universityId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useSubjects(universityId: string) {
  return useQuery({
    queryKey: ["subjects", universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("subject")
        .eq("university_id", universityId);
      if (error) throw error;
      return [...new Set(data.map((c) => c.subject))];
    },
    enabled: !!universityId,
  });
}

// ============================================================
// PROFILES / TUTORS
// ============================================================
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useTutors(universityId?: string) {
  return useQuery({
    queryKey: ["tutors", universityId],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          *,
          tutor_stats (*),
          tutor_courses (*, course:courses(*)),
          tutor_boosts (*),
          tutor_subscriptions (*)
        `)
        .eq("role", "tutor");
      if (universityId) query = query.eq("university_id", universityId);
      const { data, error } = await query;
      if (!error) return data;

      if (error.code === "PGRST200" || error.code === "PGRST201" || error.code === "PGRST204") {
        let fallbackQuery = supabase
          .from("profiles")
          .select(`
            *,
            tutor_stats (*),
            tutor_courses (*, course:courses(*))
          `)
          .eq("role", "tutor");

        if (universityId) fallbackQuery = fallbackQuery.eq("university_id", universityId);

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) throw fallbackError;
        return fallbackData;
      }

      throw error;
    },
  });
}

export function useTutor(tutorId: string) {
  return useQuery({
    queryKey: ["tutor", tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          tutor_stats (*),
          tutor_courses (*, course:courses(*))
        `)
        .eq("id", tutorId)
        .eq("role", "tutor")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tutorId,
  });
}

export function useTutorsByCourse(courseId: string) {
  return useQuery({
    queryKey: ["tutors-by-course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutor_courses")
        .select(`
          *,
          tutor:profiles (
            *,
            tutor_stats (*)
          )
        `)
        .eq("course_id", courseId);
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

// ============================================================
// REVIEWS
// ============================================================
export function useReviews(tutorId: string) {
  return useQuery({
    queryKey: ["reviews", tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          student:profiles!reviews_student_id_fkey (full_name, avatar_url, university_id),
          course:courses (code, name)
        `)
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tutorId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      tutor_id: string;
      student_id: string;
      course_id: string;
      session_id?: string;
      rating: number;
      comment: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.tutor_id] });
      queryClient.invalidateQueries({ queryKey: ["tutor", variables.tutor_id] });
      toast.success("Review submitted!");
    },
    onError: (err) => toastError(err),
  });
}

// ============================================================
// SESSIONS
// ============================================================
export function useSessions(userId: string, role: "student" | "tutor") {
  return useQuery({
    queryKey: ["sessions", userId, role],
    queryFn: async () => {
      const column = role === "student" ? "student_id" : "tutor_id";
      const select = `
          *,
          tutor:profiles!sessions_tutor_id_fkey (full_name, avatar_url),
          student:profiles!sessions_student_id_fkey (full_name, avatar_url),
          course:courses (code, name)
        `;

      const { data, error } = await supabase
        .from("sessions")
        .select(select)
        .eq(column, userId)
        .order("date", { ascending: false });

      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("sessions");
          return [];
        }
        throw error;
      }

      clearSupabaseResourceMissing("sessions");
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: {
      tutor_id: string;
      student_id: string;
      course_id: string;
      date: string;
      time: string;
      duration: number;
      location: "online" | "in-person";
      price: number;
    }) => {
      const { data, error } = await supabase
        .from("sessions")
        .insert(session)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session booked!");
    },
    onError: (err) => toastError(err),
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "upcoming" | "completed" | "cancelled";
    }) => {
      const { data, error } = await supabase
        .from("sessions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// ============================================================
// REQUESTS
// ============================================================
export function useRequests(userId: string, role: "student" | "tutor") {
  return useQuery({
    queryKey: ["requests", userId, role],
    queryFn: async () => {
      const column = role === "student" ? "student_id" : "tutor_id";
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          student:profiles!requests_student_id_fkey (full_name, avatar_url),
          tutor:profiles!requests_tutor_id_fkey (full_name, avatar_url),
          course:courses (code, name)
        `)
        .eq(column, userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: {
      student_id: string;
      tutor_id: string;
      course_id: string;
      date: string;
      time: string;
      duration: number;
      location: "online" | "in-person";
      message: string;
    }) => {
      const { data, error } = await supabase
        .from("requests")
        .insert(request)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "accepted" | "declined";
    }) => {
      const { data, error } = await supabase
        .from("requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

// ============================================================
// PROFILE UPDATE (for onboarding & settings)
// ============================================================
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Profile> & { id: string }) => {
      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (updated) return updated;

      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert({ id, ...updates })
        .select()
        .single();

      if (insertError) throw insertError;
      return inserted;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data.id] });
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("notifications")) {
        return [];
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("notifications");
          return [];
        }
        throw error;
      }
      return data;
    },
    enabled: !!userId,
  });
}

// ============================================================
// NO-SHOWS
// ============================================================
export function useNoShows(sessionId: string) {
  return useQuery({
    queryKey: ["no-shows", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("no_shows")
        .select("*")
        .eq("session_id", sessionId);
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

export function useMyNoShowCount(userId: string, role: "student" | "tutor") {
  return useQuery({
    queryKey: ["no-show-count", userId, role],
    queryFn: async () => {
      const view = role === "student" ? "student_no_show_counts" : "tutor_no_show_counts";
      const col  = role === "student" ? "student_id" : "tutor_id";
      const { data, error } = await supabase
        .from(view)
        .select("no_show_count")
        .eq(col, userId)
        .single();
      if (error) return 0;
      return (data?.no_show_count as number) ?? 0;
    },
    enabled: !!userId,
  });
}

export function useCreateNoShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      session_id: string;
      reported_by: string;
      no_show_party: "student" | "tutor";
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("no_shows")
        .insert({ ...payload, notes: payload.notes ?? "" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["no-shows", vars.session_id] });
      queryClient.invalidateQueries({ queryKey: ["no-show-count"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("No-show reported.");
    },
    onError: (err) => toastError(err),
  });
}

// ============================================================
// BLOCKS
// ============================================================
export function useMyBlocks(userId: string) {
  return useQuery({
    queryKey: ["blocks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocks")
        .select("*, blocked:profiles!blocks_blocked_id_fkey(id, full_name, avatar_url)")
        .eq("blocker_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string; blocker_id: string; blocked_id: string; created_at: string;
        blocked: { id: string; full_name: string; avatar_url: string } | null;
      }>;
    },
    enabled: !!userId,
  });
}

export function useBlockedByIds(userId: string) {
  return useQuery({
    queryKey: ["blocked-ids", userId],
    queryFn: async () => {
      const [byMe, ofMe] = await Promise.all([
        supabase.from("blocks").select("blocked_id").eq("blocker_id", userId),
        supabase.from("blocks").select("blocker_id").eq("blocked_id", userId),
      ]);
      const ids = new Set<string>();
      byMe.data?.forEach(r => ids.add(r.blocked_id));
      ofMe.data?.forEach(r => ids.add(r.blocker_id));
      return ids;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useCreateBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ blocker_id, blocked_id }: { blocker_id: string; blocked_id: string }) => {
      const { data, error } = await supabase
        .from("blocks")
        .insert({ blocker_id, blocked_id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["blocks", vars.blocker_id] });
      queryClient.invalidateQueries({ queryKey: ["blocked-ids", vars.blocker_id] });
      toast.success("User blocked.");
    },
    onError: (err) => toastError(err),
  });
}

export function useDeleteBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ blocker_id, blocked_id }: { blocker_id: string; blocked_id: string }) => {
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("blocker_id", blocker_id)
        .eq("blocked_id", blocked_id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["blocks", vars.blocker_id] });
      queryClient.invalidateQueries({ queryKey: ["blocked-ids", vars.blocker_id] });
      toast.success("User unblocked.");
    },
    onError: (err) => toastError(err),
  });
}

// ============================================================
// SEMESTERS
// ============================================================
export function useSemesters(universityId?: string) {
  return useQuery({
    queryKey: ["semesters", universityId],
    queryFn: async () => {
      let q = supabase.from("semesters").select("*").order("start_date");
      if (universityId) q = q.eq("university_id", universityId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useCurrentSemester(universityId?: string) {
  return useQuery({
    queryKey: ["current-semester", universityId],
    queryFn: async () => {
      let q = supabase.from("semesters").select("*").eq("is_current", true);
      if (universityId) q = q.eq("university_id", universityId);
      const { data, error } = await q.limit(1).maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!universityId,
    staleTime: 1000 * 60 * 60,
  });
}

// ============================================================
// COURSE SUBMISSIONS
// ============================================================
export function useCourseSubmissions(userId: string) {
  return useQuery({
    queryKey: ["course-submissions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_submissions")
        .select("*")
        .eq("submitted_by", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useSubmitCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      submitted_by: string;
      university_id: string;
      code: string;
      name: string;
      subject: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("course_submissions")
        .insert({ ...payload, notes: payload.notes ?? "" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["course-submissions", vars.submitted_by] });
      toast.success("Thanks! We'll review and add it soon.");
    },
    onError: (err) => toastError(err),
  });
}

// ============================================================
// SUPPORT TICKETS
// ============================================================
export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: string; subject: string; message: string }) => {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets", vars.user_id] });
      toast.success("Support request sent. We'll respond within 48 hours.");
    },
    onError: (err) => toastError(err),
  });
}

// ============================================================
// SUBSCRIPTION STATUS
// ============================================================
export function useTutorSubscription(tutorId: string) {
  return useQuery({
    queryKey: ["subscription", tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", tutorId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!tutorId,
    staleTime: 60_000,
  });
}

export function useAdminUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      tutor_id: string;
      status: "active" | "grace_period" | "inactive";
      current_period_end?: string;
    }) => {
      const { data, error } = await supabase
        .from("tutor_subscriptions")
        .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: "tutor_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["subscription", vars.tutor_id] });
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      toast.success("Subscription updated.");
    },
    onError: (err) => toastError(err),
  });
}

export function useAdminUpdateBoost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      tutor_id: string;
      active: boolean;
      ends_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("tutor_boosts")
        .upsert({
          tutor_id: payload.tutor_id,
          active: payload.active,
          ends_at: payload.ends_at ?? null,
          started_at: payload.active ? new Date().toISOString() : null,
        }, { onConflict: "tutor_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      toast.success("Boost updated.");
    },
    onError: (err) => toastError(err),
  });
}

export function useAdminTutors() {
  return useQuery({
    queryKey: ["admin-tutors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*, tutor_stats(*), tutor_subscriptions(*), tutor_boosts(*)`)
        .eq("role", "tutor")
        .order("full_name");
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ============================================================
// TUTOR COURSES (manage during onboarding & settings)
// ============================================================
export function useSetTutorCourses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tutorId,
      courses,
    }: {
      tutorId: string;
      courses: { course_id: string; grade: string }[];
    }) => {
      // Delete existing and re-insert (simpler than diffing)
      const { error: delError } = await supabase
        .from("tutor_courses")
        .delete()
        .eq("tutor_id", tutorId);
      if (delError) throw delError;

      if (courses.length > 0) {
        const rows = courses.map((c) => ({
          tutor_id: tutorId,
          course_id: c.course_id,
          grade: c.grade,
        }));
        const { error: insError } = await supabase
          .from("tutor_courses")
          .insert(rows);
        if (insError) throw insError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
}
