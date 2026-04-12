import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUniversities } from "@/hooks/useSupabaseQuery";
import { Avatar } from "@/components/Avatar";

const StudentPublicProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: universities = [] } = useUniversities();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-public-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, university_id, major, year, bio, role")
        .eq("id", id)
        .eq("role", "student")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const university = useMemo(
    () => universities.find((entry) => entry.id === profile?.university_id),
    [profile?.university_id, universities],
  );

  return (
    <div className="min-h-[100dvh] bg-background">
      <div
        className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 pb-4 pt-12 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        style={{ paddingTop: "max(3rem, calc(env(safe-area-inset-top, 0px) + 1rem))" }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="rounded-xl p-2 -ml-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </motion.button>
          <div>
            <p className="text-caption uppercase tracking-[0.18em] text-ink-muted">Student profile</p>
            <h1 className="text-h2 font-display text-foreground">Profile</h1>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 pb-10">
        {isLoading ? (
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse mb-4" />
            <div className="h-7 w-40 rounded bg-muted animate-pulse mb-3" />
            <div className="h-5 w-28 rounded bg-muted animate-pulse" />
          </div>
        ) : profile ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-border bg-surface px-6 py-8 text-center">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name}
                size={92}
                className="mx-auto mb-4 ring-4 ring-accent-light ring-offset-2 ring-offset-background"
              />
              <h2 className="text-h1 font-display text-foreground mb-2">
                {profile.full_name || "Student"}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                {university && (
                  <span
                    className="rounded-full px-3 py-1 text-caption font-medium"
                    style={{
                      backgroundColor: `${university.color}18`,
                      color: university.color,
                    }}
                  >
                    {university.short_name}
                  </span>
                )}
                {(profile.major || profile.year) && (
                  <span className="text-body-sm text-ink-muted">
                    {[profile.major, profile.year].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-accent-light px-3 py-1 text-caption font-medium text-accent">
                <GraduationCap size={14} />
                Student
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={16} className="text-accent" />
                <h3 className="text-label font-semibold text-foreground">About</h3>
              </div>
              <p className="text-body-sm leading-7 text-ink-muted">
                {profile.bio?.trim() || "This student has not added a bio yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-surface p-6 text-center">
            <h2 className="text-h2 font-display text-foreground mb-2">Profile unavailable</h2>
            <p className="text-body-sm text-ink-muted mb-5">
              We couldn&apos;t find this student profile right now.
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-label font-semibold text-white"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPublicProfilePage;
