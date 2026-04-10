import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { useCourses, useTutors } from "@/hooks/useSupabaseQuery";
import { TutorCard } from "@/components/TutorCard";
import { UniversityPill } from "@/components/UniversityPill";
import { UniversitySwitcher } from "@/components/UniversitySwitcher";

const filterTabs = ["All", "Courses", "Tutors", "Subjects"];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedUniversity } = useUniversity();
  const [query, setQuery] = useState(searchParams.get("subject") || "");
  const [activeTab, setActiveTab] = useState(searchParams.get("subject") ? "Courses" : "All");
  const [uniSwitcherOpen, setUniSwitcherOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([5, 50]);
  const [minRating, setMinRating] = useState(0);

  const { data: courses = [] } = useCourses(selectedUniversity);
  const { data: tutors = [] } = useTutors(selectedUniversity);

  const filteredCourses = useMemo(() => {
    if (!query) return courses;
    const q = query.toLowerCase();
    return courses.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q));
  }, [query, courses]);

  const filteredTutors = useMemo(() => {
    let result = [...tutors];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(t => t.full_name.toLowerCase().includes(q) || t.major.toLowerCase().includes(q));
    }
    result = result.filter(t => (t.hourly_rate ?? 0) >= priceRange[0] && (t.hourly_rate ?? 50) <= priceRange[1]);
    if (minRating > 0) result = result.filter(t => (t.tutor_stats?.rating ?? 0) >= minRating);
    return result;
  }, [query, tutors, priceRange, minRating]);

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-ink" />
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, tutors, or codes…"
          className="w-full pl-10 pr-10 py-3.5 rounded-lg border border-hairline bg-surface font-body text-sm" />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear"><X size={16} className="text-muted-ink" /></button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <UniversityPill onClick={() => setUniSwitcherOpen(true)} />
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setFiltersOpen(!filtersOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-hairline bg-surface text-sm font-medium">
          <SlidersHorizontal size={14} /> Filters
        </motion.button>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4">
            <div className="bg-surface rounded-xl border border-hairline p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-ink mb-2 block">Price range: ${priceRange[0]} – ${priceRange[1]}</label>
                <input type="range" min={5} max={50} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-accent" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-ink mb-2 block">Min rating: {minRating || "Any"}</label>
                <div className="flex gap-2">
                  {[0, 4, 4.5, 4.8].map(r => (
                    <button key={r} onClick={() => setMinRating(r)}
                      className={`text-xs px-3 py-1.5 rounded-pill font-medium ${minRating === r ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1 mb-5">
        {filterTabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-pill text-sm font-medium transition-colors ${activeTab === tab ? "bg-foreground text-background" : "text-muted-ink"}`}>
            {tab}
          </button>
        ))}
      </div>

      {(activeTab === "All" || activeTab === "Courses") && filteredCourses.length > 0 && (
        <div className="mb-6">
          {activeTab === "All" && <h3 className="font-display text-sm font-medium text-muted-ink mb-2 uppercase tracking-wide">Courses</h3>}
          <div className="space-y-2">
            {filteredCourses.slice(0, activeTab === "All" ? 4 : undefined).map(c => (
              <motion.button key={c.id} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/course/${c.id}`)}
                className="w-full bg-surface rounded-xl border border-hairline p-4 text-left flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-display font-medium text-sm">{c.code}</div>
                  <div className="text-xs text-muted-ink">{c.name}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {(activeTab === "All" || activeTab === "Tutors") && filteredTutors.length > 0 && (
        <div className="mb-6">
          {activeTab === "All" && <h3 className="font-display text-sm font-medium text-muted-ink mb-2 uppercase tracking-wide">Tutors</h3>}
          <div className="space-y-3">
            {filteredTutors.slice(0, activeTab === "All" ? 3 : undefined).map(t => <TutorCard key={t.id} tutor={t as any} />)}
          </div>
        </div>
      )}

      {filteredCourses.length === 0 && filteredTutors.length === 0 && query && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent-soft mx-auto mb-4 flex items-center justify-center">
            <SearchIcon size={28} className="text-accent" />
          </div>
          <p className="font-display text-lg font-medium mb-1">No results found</p>
          <p className="text-sm text-muted-ink mb-4">No tutors yet for that course. Be the first to request one.</p>
        </div>
      )}

      <UniversitySwitcher open={uniSwitcherOpen} onClose={() => setUniSwitcherOpen(false)} />
    </div>
  );
};

export default SearchPage;
