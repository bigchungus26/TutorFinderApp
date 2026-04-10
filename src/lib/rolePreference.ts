export type SelectedRole = "student" | "tutor";

export const SELECTED_ROLE_KEY = "selectedRole";

export function isSelectedRole(value: string | null): value is SelectedRole {
  return value === "student" || value === "tutor";
}

export function getSelectedRole(): SelectedRole | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(SELECTED_ROLE_KEY);
  return isSelectedRole(value) ? value : null;
}

export function setSelectedRole(role: SelectedRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_ROLE_KEY, role);
}

export function getRoleLandingPath(role: SelectedRole) {
  return role === "tutor" ? "/tutor" : "/student";
}

export function getRoleAppPath(role: SelectedRole) {
  return role === "tutor" ? "/tutor/requests" : "/discover";
}
