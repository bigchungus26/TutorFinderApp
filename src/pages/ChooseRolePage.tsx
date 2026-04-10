import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Footer } from "@/components/Footer";
import { variants } from "@/lib/motion";
import { getSelectedRole, setSelectedRole as persistSelectedRole } from "@/lib/rolePreference";

const roleOptions = [
  {
    id: "student",
    title: "Student",
    description: "Browse tutors, save favorites, and request sessions for your courses.",
    icon: BookOpen,
  },
  {
    id: "tutor",
    title: "Tutor",
    description: "Create your profile, list courses, set pricing, and manage student requests.",
    icon: GraduationCap,
  },
];

const ChooseRolePage = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"student" | "tutor">(() => getSelectedRole() ?? "student");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.role) {
      setSelectedRole(profile.role);
    }
  }, [profile]);

  const handleContinue = async () => {
    if (!user) return;
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: selectedRole })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message || "Unable to save your role. Please try again.");
      setSaving(false);
      return;
    }

    persistSelectedRole(selectedRole);
    await refreshProfile();
    navigate(`/onboarding/${selectedRole}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="h-24 w-24 rounded-full bg-surface border border-hairline animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-10 space-y-3">
          <p className="text-overline text-accent uppercase tracking-[0.2em]">Choose your path</p>
          <h1 className="text-display-lg">Are you signing up as a student or a tutor?</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            Select the experience that matches your goal and we’ll guide you through the right onboarding flow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const active = selectedRole === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedRole(option.id as "student" | "tutor")}
                className={`rounded-4xl border p-6 text-left transition-all ${
                  active
                    ? "border-accent bg-accent-soft shadow-sm"
                    : "border-hairline bg-surface hover:border-ink"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm text-accent">
                    <Icon size={22} />
                  </span>
                  <div>
                    <p className="text-body font-semibold text-ink">{option.title}</p>
                    <p className="text-body-sm text-ink-muted">{option.description}</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-ink-muted">
                  {active ? "Selected" : "Tap to choose"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-4xl border border-hairline bg-surface p-6 text-body-sm text-ink-muted">
          <p className="font-medium text-ink mb-3">What happens next?</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="mt-1 text-accent">•</span>
              {selectedRole === "student"
                ? "We’ll set up your student home feed and let you save tutors, request sessions, and track your messages."
                : "We’ll take you to tutor setup where you can add courses, rates, availability and manage your listing."}
            </li>
          </ul>
        </div>

        {error ? (
          <p className="mt-4 rounded-3xl border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        ) : null}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={saving}
          className="mt-8 w-full rounded-[1.75rem] bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/10 transition disabled:opacity-60"
        >
          {saving ? "Saving your choice…" : `Continue as ${selectedRole}`}
        </motion.button>
      </div>
      <Footer />
    </div>
  );
};

export default ChooseRolePage;
