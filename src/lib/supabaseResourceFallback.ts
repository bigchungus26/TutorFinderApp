// ============================================================
// Supabase resource fallback
// ============================================================
// Historically some tables didn't exist yet (availability, saved_tutors,
// notifications, messages, etc.) so the app fell back to localStorage.
// Now that every table is created by the migrations, the real Supabase
// path should always be attempted first. We keep the helpers so hooks
// don't need to change, but the default state is "nothing is missing".
//
// A table only gets flagged as missing at runtime if a query actually
// returns a "relation does not exist" style error — at which point the
// hook can fall back until the next page load.
// ============================================================

const STORAGE_KEY = "tutr:missing-supabase-resources:v3";

const missingResources = new Set<string>();

function syncFromStorage() {
  missingResources.clear();

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

// Best-effort: on module load, clear any stale v2 flag from before the
// schema was complete. Without this, users who hit the old fallback code
// would stay locked into localStorage-only mode.
if (typeof window !== "undefined") {
  try {
    window.sessionStorage.removeItem("tutr:missing-supabase-resources:v2");
  } catch {
    // Ignore.
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
