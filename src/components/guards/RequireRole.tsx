// ============================================================
// Tutr — RequireRole Guard
// Enforces role-based access on top of RequireAuth.
// If the authenticated user's role doesn't match the required
// role, shows a toast and redirects to their correct home.
// ============================================================

import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type RequireRoleProps = {
  role: "student" | "tutor";
  children: ReactNode;
};

const RequireRole = ({ role, children }: RequireRoleProps) => {
  const { profile, loading } = useAuth();

  const isWrongRole = !loading && profile?.role && profile.role !== role;

  // Show toast on first render when role mismatch is detected
  useEffect(() => {
    if (isWrongRole) {
      const targetLabel = role === "tutor" ? "tutors" : "students";
      toast(`This page is for ${targetLabel}`, {
        description: `You've been redirected to your home screen.`,
        duration: 4000,
      });
    }
    // Only fire once when mismatch is detected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWrongRole]);

  // Still loading — render nothing (parent RequireAuth handles the skeleton)
  if (loading) {
    return null;
  }

  // Profile not yet loaded (shouldn't normally happen after RequireAuth)
  if (!profile) {
    return null;
  }

  // Role mismatch — redirect to the user's correct home
  if (profile.role !== role) {
    const destination = profile.role === "tutor" ? "/tutor/requests" : "/";
    return <Navigate to={destination} replace />;
  }

  // Role matches — render children
  return <>{children}</>;
};

export default RequireRole;
