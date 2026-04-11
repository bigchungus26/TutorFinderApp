// ── rolePreference helpers ────────────────────────────────────
// Persists the selected role (student/tutor) across the signup flow
const KEY = "tutr:selected-role";

export type UserRole = "student" | "tutor";

export function getSelectedRole(): UserRole | null {
  const v = localStorage.getItem(KEY);
  return v === "student" || v === "tutor" ? v : null;
}

export function setSelectedRole(role: UserRole): void {
  localStorage.setItem(KEY, role);
}

export function clearSelectedRole(): void {
  localStorage.removeItem(KEY);
}
