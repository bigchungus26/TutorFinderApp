import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { universities } from "@/data/universities";
import { useUniversity } from "@/contexts/UniversityContext";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const UniversitySwitcher = ({ open, onClose }: Props) => {
  const { selectedUniversity, setSelectedUniversity } = useUniversity();

  const handleSelect = (id: string) => {
    setSelectedUniversity(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-[20px] max-w-[440px] mx-auto"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-hairline" />
            </div>
            <div className="px-6 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-medium">Choose your university</h2>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2 pb-8">
                {universities.map(uni => (
                  <motion.button
                    key={uni.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(uni.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      selectedUniversity === uni.id ? "border-accent bg-accent-soft" : "border-hairline bg-surface"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: uni.color }} />
                    <div className="flex-1 text-left">
                      <div className="font-display font-medium text-base">{uni.shortName}</div>
                      <div className="text-sm text-muted-ink">{uni.name}</div>
                    </div>
                    <div className="text-xs text-muted-ink">{uni.studentCount.toLocaleString()} students</div>
                    {selectedUniversity === uni.id && (
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
