// ============================================================
// Teachme — RequireAuth Guard
// Wraps all routes that require an authenticated user.
// If unauthenticated: saves current path as "pendingRoute" in
// sessionStorage and redirects to /welcome.
// While auth is resolving: shows a skeleton placeholder.
// ============================================================

import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type RequireAuthProps = {
  children: ReactNode;
};

function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl bg-surface border border-hairline overflow-hidden relative"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, hsl(40 33% 94%) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite",
            }}
          />
        </div>
      ))}
    </div>
  );
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Auth state is still resolving — show skeleton to avoid flash of redirect
  if (loading) {
    return <AuthSkeleton />;
  }

  // No authenticated user — save current path and redirect to welcome
  if (!user) {
    const currentPath = location.pathname + location.search + location.hash;
    sessionStorage.setItem("pendingRoute", currentPath);
    return <Navigate to="/welcome" replace />;
  }

  // Authenticated — render the protected content
  return <>{children}</>;
};

export default RequireAuth;
