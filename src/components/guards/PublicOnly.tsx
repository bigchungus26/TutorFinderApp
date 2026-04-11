import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSelectedRole, getRoleAppPath } from "@/lib/rolePreference";

type PublicOnlyProps = {
  children: ReactNode;
};

const PublicOnly = ({ children }: PublicOnlyProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const metadataRole =
    user?.user_metadata?.role === "student" || user?.user_metadata?.role === "tutor"
      ? user.user_metadata.role
      : null;
  const allowEntryGateWhileOnboarding =
    location.pathname === "/" && new URLSearchParams(location.search).get("switch") === "1";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="block h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
      </div>
    );
  }

  if (user && profile?.onboarded_at) {
    const destination = getRoleAppPath(profile.role === "tutor" ? "tutor" : "student");
    return <Navigate to={destination} replace />;
  }

  if (user && !profile?.onboarded_at) {
    if (allowEntryGateWhileOnboarding) {
      return <>{children}</>;
    }
    const role = profile?.role ?? metadataRole ?? getSelectedRole() ?? "student";
    return <Navigate to={`/onboarding/${role}`} replace />;
  }

  return <>{children}</>;
};

export default PublicOnly;
