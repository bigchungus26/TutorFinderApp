// ============================================================
// Tutr — Routing Resolution
// Pure function: maps auth/profile/network state → route string.
// No side effects. No React imports. Safe to call anywhere.
// ============================================================

export type ResolveDestinationParams = {
  user: any;
  profile: any;
  online: boolean;
  deepLink?: string;
};

/**
 * Resolves the destination route for a given auth/profile/network state.
 * Priority order:
 *  1. offline → /offline
 *  2. no user → /welcome (with optional redirect param)
 *  3. user, no role → /choose-role
 *  4. user, role, not onboarded → /onboarding/:role
 *  5. user, onboarded, student → deepLink or /
 *  6. user, onboarded, tutor → deepLink or /tutor/requests
 *  7. fallback → /
 */
export function resolveDestination({
  user,
  profile,
  online,
  deepLink,
}: ResolveDestinationParams): string {
  // 1. No network connection
  if (!online) {
    return "/offline";
  }

  // 2. Unauthenticated
  if (!user) {
    if (deepLink) {
      return `/student?redirect=${encodeURIComponent(deepLink)}`;
    }
    return "/welcome";
  }

  // 3. Authenticated but role not yet selected
  if (!profile?.role) {
    return "/choose-role";
  }

  // 4. Role selected but onboarding not completed
  if (!profile?.onboarded_at) {
    return `/onboarding/${profile.role}`;
  }

  // 5. Fully onboarded student
  if (profile.role === "student") {
    return deepLink || "/discover";
  }

  // 6. Fully onboarded tutor
  if (profile.role === "tutor") {
    return deepLink || "/tutor/requests";
  }

  // 7. Fallback
  return "/discover";
}
