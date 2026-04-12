const STORAGE_KEY = "tutr:missing-supabase-resources:v2";
const DEFAULT_MISSING_RESOURCES = [
  "student_courses",
  "saved_tutors",
  "availability",
  "notifications",
  "trending_tutors",
] as const;

const missingResources = new Set<string>();

function syncFromStorage() {
  missingResources.clear();
  DEFAULT_MISSING_RESOURCES.forEach((resource) => missingResources.add(resource));

  if (typeof window === "undefined") return;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    parsed.forEach((resource) => {
      if (typeof resource === "string" && resource) {
        missingResources.add(resource);
      }
    });
  } catch {
    // Ignore invalid storage state.
  }
}

function syncToStorage() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(missingResources)));
  } catch {
    // Ignore storage write failures.
  }
}

export function isMissingSupabaseResourceError(error: any) {
  const message = String(error?.message ?? "");

  return (
    error?.code === "PGRST204" ||
    error?.code === "PGRST205" ||
    error?.status === 404 ||
    message.includes("Could not find the table") ||
    message.includes("Could not find the") ||
    message.includes("schema cache")
  );
}

export function markSupabaseResourceMissing(resource: string) {
  syncFromStorage();
  if (!resource) return;
  missingResources.add(resource);
  syncToStorage();
}

export function isSupabaseResourceMissing(resource: string) {
  syncFromStorage();
  return missingResources.has(resource);
}

export function clearSupabaseResourceMissing(resource: string) {
  syncFromStorage();
  missingResources.delete(resource);
  syncToStorage();
}
