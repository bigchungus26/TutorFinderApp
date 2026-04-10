// ============================================================
// Tutr — PublicOnly Guard
// Wraps routes that only unauthenticated users should see
// (/welcome, /login, /signup). If the user is fully onboarded,
// they are redirected to their home. Auth loading shows a dot.
// ============================================================

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type PublicOnlyProps = {
  children: ReactNode;
};

const PublicOnly = ({ children }: PublicOnlyProps) => {
  const { user, profile, loading } = useAuth();

  // While auth state is being resolved, show a minimal loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="block w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
      </div>
    );
  }

  // Authenticated and fully onboarded → redirect to role-appropriate home
  if (user && profile?.onboarded_at) {
    const destination =
      profile.role === "tutor" ? "/tutor/requests" : "/";
    return <Navigate to={destination} replace />;
  }

  // Authenticated but not fully onboarded → redirect to onboarding flow
  if (user && !profile?.onboarded_at) {
    const destination = profile?.role
      ? `/onboarding/${profile.role}`
      : "/choose-role";
    return <Navigate to={destination} replace />;
  }

  // Unauthenticated — render the public page
  return <>{children}</>;
};

export default PublicOnly;
