// ============================================================
// SearchPage — Upgraded (Part F, Polish Pass 11)
// Tutr app
// Features: debounced input, recent searches, advanced filter
// sheet, active filter pills, empty state with course request,
// stagger animation on results.
// ============================================================
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  Star,
  Clock,
} from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { useCourses, useTutors, useUniversities } from "@/hooks/useSupabaseQuery";
import { TutorCard } from "@/components/TutorCard";
import { UniversityPill } from "@/components/UniversityPill";
import { UniversitySwitcher } from "@/components/UniversitySwitcher";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { variants } from "@/lib/motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ── Constants ──────────────────────────────────────────────────
const RECENT_KEY = "tutr:recent-searches";
const MAX_RECENT = 8;

type FilterTab = "All" | "Courses" | "Tutors";
type SortBy = "rating" | "price_asc" | "price_desc" | "newest";
type LocationFilter = "online" | "in-person" | "both";

interface Filters {
  minPrice: string;
  maxPrice: string;
  minRating: number;
  location: LocationFilter;
  sortBy: SortBy;
}

const DEFAULT_FILTERS: Filters = {
  minPrice: "",
  maxPrice: "",
  minRating: 0,
  location: "both",
  sortBy: "rating",
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

// ── Recent searches helpers ────────────────────────────────────
function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(searches: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
}

function addRecent(term: string) {
  if (!term.trim()) return;
  const list = loadRecent().filter((s) => s !== term);
  saveRecent([term, ...list]);
}

function removeRecent(term: string) {
  saveRecent(loadRecent().filter((s) => s !== term));
}

// ── Course request sheet ───────────────────────────────────────
interface CourseRequestSheetProps {
  open: boolean;
  onClose: () => void;
  initialCourse?: string;
  universityId: string;
}

function CourseRequestSheet({ open, onClose, initialCourse, universityId }: CourseRequestSheetProps) {
  const [courseCode, setCourseCode] = useState(initialCourse ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setCourseCode(initialCourse ?? "");
      setMessage("");
      setSubmitted(false);
    }
  }, [open, initialCourse]);

  const handleSubmit = async () => {
    if (!courseCode.trim()) return;
    setLoading(true);
    try {
      await supabase.from("course_requests").insert({
        course_code: courseCode.trim().toUpperCase(),
        message: message.trim(),
        university_id: universityId,
      });
      setSubmitted(true);
    } catch {
      // silent fail — toast handled elsewhere
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-display-sm text-ink">Request a course</SheetTitle>
        </SheetHeader>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={22} className="text-accent" />
            </div>
            <p className="text-body text-ink font-medium mb-1">Request submitted!</p>
            <p className="text-body-sm text-ink-muted">
              We'll notify you when a tutor is available for {courseCode}.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-label text-ink-muted block mb-1.5">Course code</label>
                <input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. CMPS 200"
                  className="w-full px-4 py-3 rounded-xl border border-hairline bg-surface text-body text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-label text-ink-muted block mb-1.5">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any specific topics you need help with?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-hairline bg-surface text-body-sm text-ink placeholder:text-ink-subtle resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading || !courseCode.trim()}
              className="w-full h-12 rounded-lg bg-accent text-accent-foreground text-label font-medium disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit request"}
            </motion.button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Advanced filter sheet ──────────────────────────────────────
interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (f: Filters) => void;
}

function FilterSheet({ open, onClose, filters, onApply }: FilterSheetProps) {
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const patch = (partial: Partial<Filters>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl pb-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-display-sm text-ink">Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Price range */}
          <div>
            <p className="text-label text-ink mb-2.5">Price range ($/hr)</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={draft.minPrice}
                onChange={(e) => patch({ minPrice: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-hairline bg-surface text-body text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-ink-subtle text-body">–</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={draft.maxPrice}
                onChange={(e) => patch({ maxPrice: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-hairline bg-surface text-body text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Min rating */}
          <div>
            <p className="text-label text-ink mb-2.5">Minimum rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => patch({ minRating: draft.minRating === n ? 0 : n })}
                  aria-label={`${n} star minimum`}
                >
                  <Star
                    size={28}
                    className={
                      n <= draft.minRating
                        ? "text-accent fill-accent"
                        : "text-ink-subtle"
                    }
                  />
                </motion.button>
              ))}
              {draft.minRating > 0 && (
                <span className="self-center ml-2 text-body-sm text-ink-muted">
                  {draft.minRating}+ stars
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-label text-ink mb-2.5">Location</p>
            <div className="flex gap-2 flex-wrap">
              {LOCATION_OPTIONS.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => patch({ location: value })}
                  className={`px-4 py-2 rounded-pill text-label transition-colors ${
                    draft.location === value
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface border border-hairline text-ink"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sort by */}
          <div>
            <p className="text-label text-ink mb-2.5">Sort by</p>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => patch({ sortBy: value })}
                  className={`px-4 py-2 rounded-pill text-label transition-colors ${
                    draft.sortBy === value
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface border border-hairline text-ink"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-7">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              patch(DEFAULT_FILTERS);
              onApply(DEFAULT_FILTERS);
              onClose();
            }}
            className="flex-1 h-12 rounded-lg border border-hairline bg-surface text-ink text-label font-medium"
          >
            Reset
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="flex-1 h-12 rounded-lg bg-accent text-accent-foreground text-label font-medium"
          >
            Apply filters
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Active filter pill ─────────────────────────────────────────
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-pill bg-accent-soft text-accent text-label"
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

// ── Main page ──────────────────────────────────────────────────
const FILTER_TABS: FilterTab[] = ["All", "Courses", "Tutors"];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedUniversity } = useUniversity();

  // ── Input state: raw (immediate) + debounced query ─────────
  const [rawQuery, setRawQuery] = useState(searchParams.get("subject") || "");
  const [query, setQuery] = useState(rawQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (value: string) => {
    setRawQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value);
      if (value.trim()) addRecent(value.trim());
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Recent searches ────────────────────────────────────────
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);
  const refreshRecent = useCallback(() => setRecentSearches(loadRecent()), []);

  const handleRemoveRecent = (term: string) => {
    removeRecent(term);
    refreshRecent();
  };

  const handlePickRecent = (term: string) => {
    setRawQuery(term);
    setQuery(term);
  };

  const handleClearAllRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  // ── Filter / UI state ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState<FilterTab>(
    searchParams.get("subject") ? "Courses" : "All"
  );
  const [uniSwitcherOpen, setUniSwitcherOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [courseRequestOpen, setCourseRequestOpen] = useState(false);

  // ── Data ───────────────────────────────────────────────────
  const { data: courses = [] } = useCourses(selectedUniversity);
  const { data: tutors = [] } = useTutors(selectedUniversity);
  const { data: universities = [] } = useUniversities();

  // ── Filtered courses ───────────────────────────────────────
  const filteredCourses = useMemo(() => {
    if (!query) return courses;
    const q = query.toLowerCase();
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q)
    );
  }, [query, courses]);

  // ── Filtered + sorted tutors ───────────────────────────────
  const filteredTutors = useMemo(() => {
    let result = [...tutors];

    // Text search
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.full_name.toLowerCase().includes(q) ||
          (t.major ?? "").toLowerCase().includes(q) ||
          (t.tutor_courses ?? []).some((tc: any) =>
            tc.course?.code?.toLowerCase().includes(q)
          )
      );
    }

    // Price filter
    const minP = appliedFilters.minPrice ? Number(appliedFilters.minPrice) : null;
    const maxP = appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : null;
    if (minP !== null) result = result.filter((t) => (t.hourly_rate ?? 0) >= minP);
    if (maxP !== null) result = result.filter((t) => (t.hourly_rate ?? 0) <= maxP);

    // Rating filter
    if (appliedFilters.minRating > 0) {
      result = result.filter(
        (t) => (t.tutor_stats?.rating ?? 0) >= appliedFilters.minRating
      );
    }

    // Location filter
    if (appliedFilters.location === "online") {
      result = result.filter((t) => t.online);
    } else if (appliedFilters.location === "in-person") {
      result = result.filter((t) => t.in_person);
    }

    // Sort
    switch (appliedFilters.sortBy) {
      case "rating":
        result.sort(
          (a, b) => (b.tutor_stats?.rating ?? 0) - (a.tutor_stats?.rating ?? 0)
        );
        break;
      case "price_asc":
        result.sort((a, b) => (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0));
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [query, tutors, appliedFilters]);

  // ── Active filter pills ────────────────────────────────────
  const activeFilterPills = useMemo(() => {
    const pills: { key: string; label: string; remove: () => void }[] = [];

    if (appliedFilters.minPrice || appliedFilters.maxPrice) {
      const from = appliedFilters.minPrice ? `$${appliedFilters.minPrice}` : "Any";
      const to = appliedFilters.maxPrice ? `$${appliedFilters.maxPrice}` : "Any";
      pills.push({
        key: "price",
        label: `${from} – ${to}/hr`,
        remove: () =>
          setAppliedFilters((f) => ({ ...f, minPrice: "", maxPrice: "" })),
      });
    }

    if (appliedFilters.minRating > 0) {
      pills.push({
        key: "rating",
        label: `${appliedFilters.minRating}+ stars`,
        remove: () => setAppliedFilters((f) => ({ ...f, minRating: 0 })),
      });
    }

    if (appliedFilters.location !== "both") {
      pills.push({
        key: "location",
        label:
          appliedFilters.location === "online" ? "Online only" : "In-person only",
        remove: () => setAppliedFilters((f) => ({ ...f, location: "both" })),
      });
    }

    if (appliedFilters.sortBy !== "rating") {
      const sortLabel =
        SORT_OPTIONS.find((s) => s.value === appliedFilters.sortBy)?.label ?? "";
      pills.push({
        key: "sort",
        label: `Sort: ${sortLabel}`,
        remove: () => setAppliedFilters((f) => ({ ...f, sortBy: "rating" })),
      });
    }

    return pills;
  }, [appliedFilters]);

  const hasActiveFilters = activeFilterPills.length > 0;

  // ── Counts for tab badges ──────────────────────────────────
  const courseCount = filteredCourses.length;
  const tutorCount = filteredTutors.length;
  const allCount = courseCount + tutorCount;

  const tabCount: Record<FilterTab, number> = {
    All: allCount,
    Courses: courseCount,
    Tutors: tutorCount,
  };

  const hasResults =
    filteredCourses.length > 0 || filteredTutors.length > 0;

  const noResults =
    filteredCourses.length === 0 && filteredTutors.length === 0 && !!query;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="px-5 pt-14 pb-4 md:px-8 md:py-6 md:max-w-6xl md:mx-auto">

      {/* ── Search input ────────────────────────────────────── */}
      <div className="relative mb-3">
        <SearchIcon
          size={20}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
        />
        <input
          autoFocus
          value={rawQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search tutors, courses..."
          className="w-full h-14 pl-11 pr-10 rounded-xl border border-hairline bg-surface text-body text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
        />
        {rawQuery && (
          <button
            onClick={() => {
              setRawQuery("");
              setQuery("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X size={16} className="text-ink-muted" />
          </button>
        )}
      </div>

      {/* ── Row: university pill + filters button ─────────── */}
      <div className="flex items-center gap-2 mb-3">
        <UniversityPill onClick={() => setUniSwitcherOpen(true)} />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setFiltersOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border text-label font-medium transition-colors ${
            hasActiveFilters
              ? "border-accent bg-accent-soft text-accent"
              : "border-hairline bg-surface text-ink"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFilterPills.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Active filter pills ──────────────────────────── */}
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
                {activeFilterPills.map((pill) => (
                  <FilterPill
                    key={pill.key}
                    label={pill.label}
                    onRemove={pill.remove}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recent searches (shown when input is empty) ───── */}
      <AnimatePresence>
        {!rawQuery && recentSearches.length > 0 && (
          <motion.div
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-5"
          >
            {/* Header row with label + clear button */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-overline text-ink-muted">RECENT</p>
              <button
                onClick={handleClearAllRecent}
                className="text-caption text-ink-muted hover:text-ink transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Staggered chips */}
            <motion.div
              variants={variants.staggerChildren}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-2"
            >
              {recentSearches.map((term) => (
                <motion.div
                  key={term}
                  variants={variants.staggerItem}
                  className="inline-flex items-center gap-0.5"
                >
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handlePickRecent(term)}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-l-pill bg-surface border border-hairline text-body-sm text-ink hover:bg-muted transition-colors"
                  >
                    <Clock size={12} className="text-ink-muted flex-shrink-0" />
                    {term}
                  </motion.button>
                  <button
                    onClick={() => handleRemoveRecent(term)}
                    className="pl-1.5 pr-3 py-1.5 rounded-r-pill border border-l-0 border-hairline bg-surface text-ink-subtle hover:text-ink transition-colors"
                    aria-label={`Remove "${term}" from recent`}
                  >
                    <X size={11} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESULTS overline + filter tabs ─────────────────── */}
      {hasResults && (
        <p className="text-overline text-ink-muted mb-2">RESULTS</p>
      )}

      {/* ── Filter tabs with count badges ──────────────────── */}
      <div className="flex gap-1 mb-5">
        {FILTER_TABS.map((tab) => {
          const count = tabCount[tab];
          return (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-label font-medium transition-colors ${
                activeTab === tab
                  ? "bg-foreground text-background"
                  : "text-ink-muted"
              }`}
            >
              {tab}
              {query && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab
                      ? "bg-background/20 text-background"
                      : "bg-muted text-ink-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Courses section ────────────────────────────────── */}
      {(activeTab === "All" || activeTab === "Courses") &&
        filteredCourses.length > 0 && (
          <div className="mb-6">
            {activeTab === "All" && (
              <h3 className="text-caption text-ink-muted uppercase tracking-wider mb-2">
                Courses
              </h3>
            )}
            <motion.div
              variants={variants.staggerChildren}
              initial="hidden"
              animate="visible"
              className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3"
            >
              {filteredCourses
                .slice(0, activeTab === "All" ? 4 : undefined)
                .map((c, i) => {
                  const uni = universities.find((u) => u.id === c.university_id);
                  return (
                    <motion.div key={c.id} variants={variants.staggerItem} custom={i}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/course/${c.id}`)}
                        className="w-full relative overflow-hidden bg-surface rounded-xl border border-hairline p-4 text-left flex items-center gap-3"
                      >
                        {/* Left accent bar tinted by university color */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                          style={{ backgroundColor: uni?.color ?? "#2fa86e" }}
                        />
                        <div className="flex-1 pl-4">
                          <div className="text-label text-ink font-medium">{c.code}</div>
                          <div className="text-body-sm text-ink-muted">{c.name}</div>
                        </div>
                      </motion.button>
                    </motion.div>
                  );
                })}
            </motion.div>
          </div>
        )}

      {/* ── Tutors section ─────────────────────────────────── */}
      {(activeTab === "All" || activeTab === "Tutors") &&
        filteredTutors.length > 0 && (
          <div className="mb-6">
            {activeTab === "All" && (
              <h3 className="text-caption text-ink-muted uppercase tracking-wider mb-2">
                Tutors
              </h3>
            )}
            <motion.div
              variants={variants.staggerChildren}
              initial="hidden"
              animate="visible"
              className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4"
            >
              {filteredTutors
                .slice(0, activeTab === "All" ? 3 : undefined)
                .map((t, i) => (
                  <motion.div key={t.id} variants={variants.staggerItem} custom={i}>
                    <TutorCard tutor={t as any} />
                  </motion.div>
                ))}
            </motion.div>
          </div>
        )}

      {/* ── Empty state ────────────────────────────────────── */}
      {noResults && (
        <EmptyState
          icon={SearchIcon}
          title="No tutors found"
          description="Try a different search or adjust your filters"
          action={{
            label: "Request this course",
            onClick: () => setCourseRequestOpen(true),
          }}
        />
      )}

      {/* ── Modals / Sheets ─────────────────────────────────── */}
      <UniversitySwitcher
        open={uniSwitcherOpen}
        onClose={() => setUniSwitcherOpen(false)}
      />

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={appliedFilters}
        onApply={setAppliedFilters}
      />

      <CourseRequestSheet
        open={courseRequestOpen}
        onClose={() => setCourseRequestOpen(false)}
        initialCourse={rawQuery}
        universityId={selectedUniversity}
      />
    </div>
  );
};

export default SearchPage;
