// ============================================================
// Tutr — Auth State Listener
// Call initAuthListener() once at app mount (inside BrowserRouter)
// to wire up global sign-out handling.
//
// On SIGNED_OUT:
//   • Shows a "You've been signed out" toast via sonner
//   • Saves the current pathname to sessionStorage as "pendingRoute"
//     so the SplashPage can redirect back after re-authentication
//   • Navigates to /welcome
// ============================================================

import { NavigateFunction } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Subscribes to Supabase auth state changes and handles global
 * sign-out side effects.
 *
 * @param navigate  - react-router-dom NavigateFunction (must be called inside <BrowserRouter>)
 * @param queryClient - TanStack QueryClient; used to clear all cached queries on sign-out
 * @returns A cleanup function that unsubscribes the listener. Call it on component unmount.
 *
 * @example
 * // Inside a component rendered within <BrowserRouter>:
 * useEffect(() => {
 *   const cleanup = initAuthListener(navigate, queryClient);
 *   return cleanup;
 * }, []);
 */
export function initAuthListener(
  navigate: NavigateFunction,
  queryClient: QueryClient
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, _session) => {
    if (event === "SIGNED_OUT") {
      // Save current location so the user can be redirected back after login
      const currentPath =
        window.location.pathname + window.location.search + window.location.hash;

      // Only persist non-trivial paths (avoid saving /welcome, /login, /signup, /splash)
      const skipPaths = ["/welcome", "/login", "/signup", "/offline", "/"];
      if (!skipPaths.includes(window.location.pathname)) {
        sessionStorage.setItem("pendingRoute", currentPath);
      }

      // Clear all server-state caches so stale data doesn't leak across accounts
      queryClient.clear();

      // Notify the user
      toast("You've been signed out", {
        description: "Sign back in to continue where you left off.",
        duration: 4000,
      });

      // Redirect to welcome screen
      navigate("/welcome", { replace: true });
    }
  });

  // Return cleanup to cancel the subscription
  return () => subscription.unsubscribe();
}
