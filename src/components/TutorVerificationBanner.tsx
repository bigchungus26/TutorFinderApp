// ============================================================
// TutorVerificationBanner
// Sticky-top status banner shown to tutors who are pending,
// rejected, or under resubmission. Hidden when approved.
// ============================================================
import { Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck, Hourglass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function TutorVerificationBanner() {
  const { profile } = useAuth();
  if (!profile || profile.role !== "tutor") return null;

  const status = profile.verification_status;
  if (status === "approved") return null;

  if (status === "rejected") {
    return (
      <div className="sticky top-0 z-30 border-b border-red-300/40 bg-red-50 px-4 py-3 text-red-900 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
        <div className="mx-auto flex max-w-[440px] items-start gap-3">
          <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-label font-semibold">Verification needs another look</p>
            <p className="mt-0.5 text-caption opacity-90">
              We couldn't approve your verification yet. Open your profile to update your documents.
            </p>
          </div>
          <Link
            to="/tutor/profile?verify=1"
            className="rounded-lg bg-red-900 px-3 py-1.5 text-caption font-semibold text-white hover:opacity-90 dark:bg-red-200 dark:text-red-950"
          >
            Fix
          </Link>
        </div>
      </div>
    );
  }

  // pending (default for new + resubmission)
  return (
    <div className="sticky top-0 z-30 border-b border-amber-300/40 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="mx-auto flex max-w-[440px] items-start gap-3">
        <Hourglass size={18} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-label font-semibold">Verification in review</p>
          <p className="mt-0.5 text-caption opacity-90">
            Students can't book you yet. We usually review new tutors within 24 hours.
          </p>
        </div>
        <Link
          to="/tutor/profile?verify=1"
          className="inline-flex items-center gap-1 rounded-lg bg-amber-900 px-3 py-1.5 text-caption font-semibold text-white hover:opacity-90 dark:bg-amber-200 dark:text-amber-950"
        >
          <ShieldCheck size={12} />
          Review
        </Link>
      </div>
    </div>
  );
}
