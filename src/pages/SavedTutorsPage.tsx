import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedTutors, useUnsaveTutor } from "@/hooks/useSavedTutors";
import { TutorCard } from "@/components/TutorCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonList, TutorCardSkeleton } from "@/components/skeletons";
import { variants, transitions } from "@/lib/motion";

const SavedTutorsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: savedEntries = [], isLoading } = useSavedTutors(profile?.id ?? "");
  const unsaveTutor = useUnsaveTutor();

  const handleUnsave = (tutorId: string) => {
    if (!profile) return;
    unsaveTutor.mutate({ studentId: profile.id, tutorId });
  };

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </motion.button>
        <h1 className="font-display text-h1 font-display text-foreground">Saved tutors</h1>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonList count={4} component={TutorCardSkeleton} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && savedEntries.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No saved tutors yet"
          description="Tap the heart on any tutor card to save them for later"
        />
      )}

      {/* Tutor list */}
      {!isLoading && savedEntries.length > 0 && (
        <motion.div
          variants={variants.staggerChildren}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {savedEntries.map((entry: any) => {
              const tutor = entry.tutor;
              if (!tutor) return null;
              return (
                <motion.div
                  key={entry.id}
                  variants={variants.staggerItem}
                  layout
                  exit={{ opacity: 0, scale: 0.96, transition: transitions.fast }}
                  className="relative"
                >
                  <TutorCard tutor={tutor} />
                  {/* Unsave heart button */}
                  <motion.button
                    whileTap={{
                      scale: 0.8,
                      transition: { type: "spring", stiffness: 500, damping: 20 },
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleUnsave(tutor.id)}
                    aria-label={`Remove ${tutor.full_name} from saved`}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-surface border border-border shadow-sm"
                  >
                    <Heart size={16} className="text-accent fill-accent" />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default SavedTutorsPage;
