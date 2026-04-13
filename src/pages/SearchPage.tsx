// ============================================================
// SearchPage — Part 2.10
// Debounced search, recent searches, filter sheet,
// active filter pills, stagger results.
// ============================================================
import { useState, useMemo, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, X, Star, Clock } from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { useCourses, useTutors, useUniversities, useBlockedByIds, useSubmitCourse } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedTutors } from "@/hooks/useSavedTutors";
import { TutorCard } from "@/components/TutorCard";
import { UniversityPill } from "@/components/UniversityPill";
import { UniversitySwitcher } from "@/components/UniversitySwitcher";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { springs, variants } from "@/lib/motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ── Constants ────────────────────────────────────────────────
const RECENT_KEY = "tutr:recent-searches";
const MAX_RECENT = 3;

type FilterTab = "All" | "Courses" | "Tutors";
type SortBy = "rating" | "price_asc" | "price_desc" | "newest";
type LocationFilter = "online" | "in-person" | "both";
type TutorStatusFilter = "student" | "alumni" | "";

interface Filters {
  minPrice: string;
  maxPrice: string;
  minRating: number;
  location: LocationFilter;
  sortBy: SortBy;
  tutorStatus: TutorStatusFilter;
}

const DEFAULT_FILTERS: Filters = {
  minPrice: "", maxPrice: "", minRating: 0, location: "both", sortBy: "rating", tutorStatus: "",
};

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "rating", label: "Rating" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "newest", label: "Newest" },
];

const LOCATION_OPTIONS: { value: LocationFilter; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "in-person", label: "In-person" },
  { value: "both", label: "Both" },
];

// ── Recent searches helpers ──────────────────────────────────
function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
  catch { return []; }
}
function saveRecent(s: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(s.slice(0, MAX_RECENT)));
}
function addRecent(term: string) {
  if (!term.trim()) return;
  saveRecent([term, ...loadRecent().filter(s => s !== term)]);
}
function removeRecent(term: string) {
  saveRecent(loadRecent().filter(s => s !== term));
}

// ── Course submission sheet ─────────────────────────────────────
export function CourseSubmissionSheet({ open, onClose, initialCode, universityId }: {
  open: boolean; onClose: () => void; initialCode?: string; universityId: string;
}) {
  const { user } = useAuth();
  const submitCourse = useSubmitCourse();
  const [code, setCode] = useState(initialCode ?? "");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) { setCode(initialCode ?? ""); setName(""); setSubject(""); setNotes(""); }
  }, [open, initialCode]);

  const handleSubmit = async () => {
    if (!user?.id || !code.trim() || !name.trim()) return;
    await submitCourse.mutateAsync({
      submitted_by: user.id,
      university_id: universityId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      subject: subject.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-10">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-h2 font-display">Submit a course</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-label text-ink-muted block mb-1.5">Course code <span className="text-red-400">*</span></label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CMPS 200"
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="text-label text-ink-muted block mb-1.5">Course name <span className="text-red-400">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Introduction to Computer Science"
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="text-label text-ink-muted block mb-1.5">Subject / department</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Computer Science"
              style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="text-label text-ink-muted block mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context…" rows={2} style={{ fontSize: "16px" }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-muted resize-none focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} transition={springs.snappy}
          onClick={handleSubmit}
          disabled={submitCourse.isPending || !code.trim() || !name.trim()}
          className="w-full h-13 rounded-xl bg-accent text-white text-label font-semibold disabled:opacity-50">
          {submitCourse.isPending ? "Submitting…" : "Submit course"}
        </motion.button>
      </SheetContent>
    </Sheet>
  );
}

// ── Filter sheet ─────────────────────────────────────────────
function FilterSheet({ open, onClose, filters, onApply }: {
  open: boolean; onClose: () => void; filters: Filters; onApply: (f: Filters) => void;
}) {
  const [draft, setDraft] = useState<Filters>(filters);
  useEffect(() => { if (open) setDraft(filters); }, [open, filters]);
  const patch = (p: Partial<Filters>) => setDraft(prev => ({ ...prev, ...p }));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-h2 font-display">Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <p className="text-label text-foreground mb-2.5">Price range ($/hr)</p>
            <div className="flex items-center gap-3">
              <input
                type="number" min={0} placeholder="Min"
                value={draft.minPrice}
                onChange={e => patch({ minPrice: e.target.value })}
                style={{ fontSize: "16px" }}
                className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
              />
              <span className="text-ink-muted">–</span>
              <input
                type="number" min={0} placeholder="Max"
                value={draft.maxPrice}
                onChange={e => patch({ maxPrice: e.target.value })}
                style={{ fontSize: "16px" }}
                className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <p className="text-label text-foreground mb-2.5">Minimum rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.9 }}
                  transition={springs.snappy}
                  onClick={() => patch({ minRating: draft.minRating === n ? 0 : n })}
                  aria-label={`${n} star minimum`}
                >
                  <Star size={28} className={n <= draft.minRating ? "text-accent fill-accent" : "text-ink-muted"} />
                </motion.button>
              ))}
              {draft.minRating > 0 && (
                <span className="self-center ml-2 text-body-sm text-ink-muted">{draft.minRating}+ stars</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-label text-foreground mb-2.5">Location</p>
            <div className="flex gap-2 flex-wrap">
              {LOCATION_OPTIONS.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  transition={springs.snappy}
                  onClick={() => patch({ location: value })}
                  className={`px-4 py-2 rounded-full text-label transition-colors ${
                    draft.location === value
                      ? "bg-accent text-white"
                      : "bg-surface border border-border text-foreground"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-label text-foreground mb-2.5">Tutor type</p>
            <div className="flex gap-2 flex-wrap">
              {([
                { value: "" as TutorStatusFilter, label: "Any" },
                { value: "student" as TutorStatusFilter, label: "Current student" },
                { value: "alumni" as TutorStatusFilter, label: "Alumni" },
              ]).map(({ value, label }) => (
                <motion.button
                  key={value || "any"}
                  whileTap={{ scale: 0.96 }}
                  transition={springs.snappy}
                  onClick={() => patch({ tutorStatus: value })}
                  className={`px-4 py-2 rounded-full text-label transition-colors ${
                    draft.tutorStatus === value
                      ? "bg-accent text-white"
                      : "bg-surface border border-border text-foreground"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-label text-foreground mb-2.5">Sort by</p>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  transition={springs.snappy}
                  onClick={() => patch({ sortBy: value })}
                  className={`px-4 py-2 rounded-full text-label transition-colors ${
                    draft.sortBy === value
                      ? "bg-accent text-white"
                      : "bg-surface border border-border text-foreground"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={() => { patch(DEFAULT_FILTERS); onApply(DEFAULT_FILTERS); onClose(); }}
            className="flex-1 h-12 rounded-xl border border-border bg-surface text-foreground text-label font-medium"
          >
            Reset
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={() => { onApply(draft); onClose(); }}
            className="flex-1 h-12 rounded-xl bg-accent text-white text-label font-medium"
          >
            Apply
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Active filter pill ───────────────────────────────────────
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-accent-light text-accent text-label"
    >
      {label}
      <button
        onClick={onRemove}
        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-accent/20 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={11} />
      </button>
    </motion.span>
  );
}

// ── Main page ────────────────────────────────────────────────
const FILTER_TABS: FilterTab[] = ["All", "Courses", "Tutors"];

const RESULTS_PAGE_SIZE = 12;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedUniversity } = useUniversity();
  const { user, profile } = useAuth();
  const studentId = profile?.role === "student" ? (profile.id ?? "") : "";

  const [rawQuery, setRawQuery] = useState(searchParams.get("subject") || "");
  const [query, setQuery] = useState(rawQuery);
  const [codeOnly, setCodeOnly] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (value: string) => {
    setRawQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value);
      if (value.trim()) addRecent(value.trim());
    }, 250);
  };

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);
  const refreshRecent = useCallback(() => setRecentSearches(loadRecent()), []);

  const [activeTab, setActiveTab] = useState<FilterTab>(
    searchParams.get("subject") ? "Courses" : "All"
  );
  const [uniSwitcherOpen, setUniSwitcherOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [courseRequestOpen, setCourseRequestOpen] = useState(false);

  const { data: courses = [] } = useCourses(selectedUniversity);
  const { data: tutors = [] } = useTutors(selectedUniversity);
  const { data: universities = [] } = useUniversities();
  const { data: blockedIds } = useBlockedByIds(user?.id ?? "");
  const { data: savedEntries = [] } = useSavedTutors(studentId);
  const savedTutorIds = useMemo(
    () => new Set(savedEntries.map((e: any) => e.tutor_id as string)),
    [savedEntries]
  );

  // Pagination: reset when search/filter changes
  const [displayCount, setDisplayCount] = useState(RESULTS_PAGE_SIZE);
  useEffect(() => { setDisplayCount(RESULTS_PAGE_SIZE); }, [query, appliedFilters, activeTab]);

  const filteredCourses = useMemo(() => {
    if (!query) return courses;
    const q = query.toLowerCase().trim();
    // Split query into whitespace-separated tokens so "physics 211"
    // splits into ["physics","211"]. A course matches when every token
    // hits at least one of: code, name, or subject (AND across tokens).
    const tokens = q.split(/\s+/).filter(Boolean);
    const matched = courses.filter(c => {
      const code = c.code.toLowerCase();
      const name = c.name.toLowerCase();
      const subject = c.subject?.toLowerCase() ?? "";
      if (codeOnly) {
        return tokens.every(t => code.includes(t));
      }
      return tokens.every(t =>
        code.includes(t) || name.includes(t) || subject.includes(t)
      );
    });
    // Sort: exact code match first, then starts-with code, then rest
    return matched.sort((a, b) => {
      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();
      const aExact = aCode === q ? 0 : aCode.startsWith(q) ? 1 : 2;
      const bExact = bCode === q ? 0 : bCode.startsWith(q) ? 1 : 2;
      return aExact - bExact;
    });
  }, [query, courses, codeOnly]);

  const filteredTutors = useMemo(() => {
    // Filter: skip blocked users (subscription check temporarily disabled for testing)
    let result = tutors.filter((t: any) => {
      if (blockedIds?.has(t.id)) return false;
      return true;
    });

    if (query) {
      const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
      result = result.filter(t => {
        const name = t.full_name.toLowerCase();
        const major = (t.major ?? "").toLowerCase();
        const courseCodes = (t.tutor_courses ?? [])
          .map((tc: any) => tc.course?.code?.toLowerCase() ?? "")
          .join(" ");
        // Every token must match at least one field
        return tokens.every(tok =>
          name.includes(tok) || major.includes(tok) || courseCodes.includes(tok)
        );
      });
    }

    const minP = appliedFilters.minPrice ? Number(appliedFilters.minPrice) : null;
    const maxP = appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : null;
    if (minP !== null) result = result.filter(t => (t.hourly_rate ?? 0) >= minP);
    if (maxP !== null) result = result.filter(t => (t.hourly_rate ?? 0) <= maxP);

    if (appliedFilters.minRating > 0) {
      result = result.filter(t => (t.stats?.avg_rating ?? t.tutor_stats?.rating ?? 0) >= appliedFilters.minRating);
    }

    if (appliedFilters.location === "online") result = result.filter(t => t.online);
    else if (appliedFilters.location === "in-person") result = result.filter(t => t.in_person);

    if (appliedFilters.tutorStatus) {
      result = result.filter(t => (t as any).tutor_status === appliedFilters.tutorStatus);
    }

    switch (appliedFilters.sortBy) {
      case "rating":
        result.sort((a, b) => (b.stats?.avg_rating ?? 0) - (a.stats?.avg_rating ?? 0));
        break;
      case "price_asc":
        result.sort((a, b) => (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Story 31: Boosted tutors surface first within their rating tier
    const isActive = (t: any) => {
      const boost = (t as any).tutor_boosts;
      if (!boost) return false;
      const b = Array.isArray(boost) ? boost[0] : boost;
      return b?.active && (!b?.ends_at || new Date(b.ends_at) > new Date());
    };
    result.sort((a, b) => {
      const aB = isActive(a) ? 1 : 0;
      const bB = isActive(b) ? 1 : 0;
      if (bB !== aB) return bB - aB;
      return 0; // preserve existing sort within tier
    });

    return result;
  }, [query, tutors, appliedFilters]);

  const activeFilterPills = useMemo(() => {
    const pills: { key: string; label: string; remove: () => void }[] = [];
    if (appliedFilters.minPrice || appliedFilters.maxPrice) {
      const from = appliedFilters.minPrice ? `$${appliedFilters.minPrice}` : "Any";
      const to = appliedFilters.maxPrice ? `$${appliedFilters.maxPrice}` : "Any";
      pills.push({ key: "price", label: `${from}–${to}/hr`, remove: () => setAppliedFilters(f => ({ ...f, minPrice: "", maxPrice: "" })) });
    }
    if (appliedFilters.minRating > 0) {
      pills.push({ key: "rating", label: `${appliedFilters.minRating}+ stars`, remove: () => setAppliedFilters(f => ({ ...f, minRating: 0 })) });
    }
    if (appliedFilters.location !== "both") {
      pills.push({ key: "location", label: appliedFilters.location === "online" ? "Online only" : "In-person only", remove: () => setAppliedFilters(f => ({ ...f, location: "both" })) });
    }
    if (appliedFilters.sortBy !== "rating") {
      const label = SORT_OPTIONS.find(s => s.value === appliedFilters.sortBy)?.label ?? "";
      pills.push({ key: "sort", label: `Sort: ${label}`, remove: () => setAppliedFilters(f => ({ ...f, sortBy: "rating" })) });
    }
    if (appliedFilters.tutorStatus) {
      const label = appliedFilters.tutorStatus === "student" ? "Current students only" : "Alumni only";
      pills.push({ key: "tutorStatus", label, remove: () => setAppliedFilters(f => ({ ...f, tutorStatus: "" })) });
    }
    return pills;
  }, [appliedFilters]);

  const hasActiveFilters = activeFilterPills.length > 0;
  const courseCount = filteredCourses.length;
  const tutorCount = filteredTutors.length;
  const tabCount: Record<FilterTab, number> = { All: courseCount + tutorCount, Courses: courseCount, Tutors: tutorCount };
  const hasResults = courseCount > 0 || tutorCount > 0;
  const noResults = !hasResults && !!query;

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Search input */}
      <div className="relative mb-3">
        <SearchIcon size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        <input
          autoFocus
          value={rawQuery}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="Search tutors, courses…"
          style={{ fontSize: "16px" }}
          className="w-full h-14 pl-11 pr-10 rounded-xl border border-border bg-surface text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
        />
        {rawQuery && (
          <button
            onClick={() => { setRawQuery(""); setQuery(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X size={16} className="text-ink-muted" />
          </button>
        )}
      </div>

      {/* University pill + filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <UniversityPill onClick={() => setUniSwitcherOpen(true)} />
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={springs.snappy}
          onClick={() => setFiltersOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-label font-medium transition-colors ${
            hasActiveFilters ? "border-accent bg-accent-light text-accent" : "border-border bg-surface text-foreground"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterPills.length}
            </span>
          )}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={springs.snappy}
          onClick={() => setCodeOnly(v => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-label font-medium transition-colors ${
            codeOnly ? "border-accent bg-accent-light text-accent" : "border-border bg-surface text-foreground"
          }`}
        >
          Code only
        </motion.button>
      </div>

      {/* Active filter pills */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <AnimatePresence>
                {activeFilterPills.map(pill => (
                  <FilterPill key={pill.key} label={pill.label} onRemove={pill.remove} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent searches */}
      <AnimatePresence>
        {!rawQuery && recentSearches.length > 0 && (
          <motion.div
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-overline text-ink-muted">Recent</p>
              <button
                onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }}
                className="text-caption text-ink-muted"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(term => (
                <div key={term} className="inline-flex items-center">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    transition={springs.snappy}
                    onClick={() => { setRawQuery(term); setQuery(term); }}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-l-full bg-surface border border-border text-body-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Clock size={12} className="text-ink-muted flex-shrink-0" />
                    {term}
                  </motion.button>
                  <button
                    onClick={() => { removeRecent(term); refreshRecent(); }}
                    className="pl-1.5 pr-3 py-1.5 rounded-r-full border border-l-0 border-border bg-surface text-ink-muted hover:text-foreground transition-colors"
                    aria-label={`Remove "${term}"`}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4">
        {FILTER_TABS.map(tab => (
          <motion.button
            key={tab}
            whileTap={{ scale: 0.96 }}
            transition={springs.snappy}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-label font-medium transition-colors ${
              activeTab === tab ? "bg-foreground text-background" : "text-ink-muted"
            }`}
          >
            {tab}
            {query && tabCount[tab] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab ? "bg-white/20 text-background" : "bg-muted text-ink-muted"
              }`}>
                {tabCount[tab]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Courses section */}
      {(activeTab === "All" || activeTab === "Courses") && (filteredCourses.length > 0 || !!rawQuery) && (
        <div className="mb-6">
          {activeTab === "All" && (
            <p className="text-overline text-ink-muted mb-2">Courses</p>
          )}
          <div className="space-y-2">
            {filteredCourses.map((c) => {
              const uni = universities.find(u => u.id === c.university_id);
              return (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.98 }}
                  transition={springs.snappy}
                  onClick={() => navigate(`/course/${c.id}`)}
                  className="w-full relative overflow-hidden bg-surface rounded-xl border border-border p-4 text-left flex items-center gap-3"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                    style={{ backgroundColor: uni?.color ?? "#2ba66a" }}
                  />
                  <div className="flex-1 pl-4">
                    <div className="text-label text-foreground font-medium">{c.code}</div>
                    <div className="text-body-sm text-ink-muted">{c.name}</div>
                  </div>
                </motion.button>
              );
            })}
            {/* Don't see your course? */}
            <motion.button
              whileTap={{ scale: 0.98 }} transition={springs.snappy}
              onClick={() => setCourseRequestOpen(true)}
              className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent transition-colors"
            >
              Don't see your course? Submit it →
            </motion.button>
          </div>
        </div>
      )}

      {/* Tutors section */}
      {(activeTab === "All" || activeTab === "Tutors") && filteredTutors.length > 0 && (
        <div className="mb-6">
          {activeTab === "All" && (
            <p className="text-overline text-ink-muted mb-2">Tutors</p>
          )}
          <div className="space-y-3">
            {filteredTutors.slice(0, displayCount).map((t) => {
              const boost = (t as any).tutor_boosts;
              const b = Array.isArray(boost) ? boost[0] : boost;
              const isFeatured = b?.active && (!b?.ends_at || new Date(b.ends_at) > new Date());
              return (
                <div key={t.id}>
                  {isFeatured && (
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <span className="inline-flex items-center gap-1 text-caption font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        ⚡ Featured
                      </span>
                    </div>
                  )}
                  <TutorCard tutor={t as any} isSaved={savedTutorIds.has(t.id)} />
                </div>
              );
            })}
          </div>
          {filteredTutors.length > displayCount && (
            <motion.button
              whileTap={{ scale: 0.97 }} transition={springs.snappy}
              onClick={() => setDisplayCount(n => n + RESULTS_PAGE_SIZE)}
              className="w-full mt-4 py-3 rounded-xl border border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent transition-colors"
            >
              Show {Math.min(RESULTS_PAGE_SIZE, filteredTutors.length - displayCount)} more tutors
            </motion.button>
          )}
        </div>
      )}

      {/* Empty state */}
      {noResults && (
        <EmptyState
          icon={SearchIcon}
          title="No results found"
          description="Try a different search or adjust your filters"
          action={{ label: "Request this course", onClick: () => setCourseRequestOpen(true) }}
        />
      )}

      {/* Sheets */}
      <UniversitySwitcher open={uniSwitcherOpen} onClose={() => setUniSwitcherOpen(false)} />
      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={appliedFilters} onApply={setAppliedFilters} />
      <CourseSubmissionSheet open={courseRequestOpen} onClose={() => setCourseRequestOpen(false)} initialCode={rawQuery} universityId={selectedUniversity} />
    </div>
  );
};

export default SearchPage;
