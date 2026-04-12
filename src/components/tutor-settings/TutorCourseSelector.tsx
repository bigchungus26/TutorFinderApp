import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Course } from "@/types/database";

interface TutorCourseSelectorProps {
  courses: Course[];
  selectedCourseIds: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function TutorCourseSelector({
  courses,
  selectedCourseIds,
  onChange,
  disabled,
}: TutorCourseSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses.slice(0, 30);

    return courses.filter((course) =>
      `${course.code} ${course.name}`.toLowerCase().includes(query),
    );
  }, [courses, search]);

  const selectedCourses = useMemo(
    () => courses.filter((course) => selectedCourseIds.includes(course.id)),
    [courses, selectedCourseIds],
  );

  const toggle = (courseId: string) => {
    if (selectedCourseIds.includes(courseId)) {
      onChange(selectedCourseIds.filter((id) => id !== courseId));
      return;
    }

    onChange([...selectedCourseIds, courseId]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tutor-course-search">Search courses</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="tutor-course-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by course code or name"
            className="pl-9"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Selected courses ({selectedCourseIds.length})
        </p>
        {selectedCourses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Pick the courses you want students to find you for.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedCourses.map((course) => (
              <span
                key={course.id}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
              >
                {course.code}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-background/70">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Available courses</p>
          <p className="text-xs text-muted-foreground">
            Tap one or more courses to add them to your tutor profile.
          </p>
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto p-2">
          {filteredCourses.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matching courses found.
            </div>
          ) : (
            filteredCourses.map((course) => {
              const checked = selectedCourseIds.includes(course.id);

              return (
                <label
                  key={course.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                    checked ? "bg-accent/10" : "hover:bg-muted/60"
                  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(course.id)}
                    disabled={disabled}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-accent" />
                      <span className="text-sm font-semibold text-foreground">{course.code}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{course.name}</p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
