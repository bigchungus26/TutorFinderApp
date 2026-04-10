import { motion } from "framer-motion";
import { useUniversity } from "@/contexts/UniversityContext";
import { useUniversities } from "@/hooks/useSupabaseQuery";

interface Props {
  onClick: () => void;
}

export const UniversityPill = ({ onClick }: Props) => {
  const { selectedUniversity } = useUniversity();
  const { data: universities = [] } = useUniversities();
  const uni = universities.find(u => u.id === selectedUniversity);
  if (!uni) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface border border-hairline text-sm font-body font-medium"
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: uni.color }} />
      {uni.short_name}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-ink"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </motion.button>
  );
};
