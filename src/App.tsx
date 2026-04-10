import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UniversityProvider } from "@/contexts/UniversityContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StudentLayout } from "@/components/StudentLayout";
import { TutorLayout } from "@/components/TutorLayout";
import RequireAuth from "@/components/guards/RequireAuth";
import RequireRole from "@/components/guards/RequireRole";
import PublicOnly from "@/components/guards/PublicOnly";
import { lazy, Suspense, useEffect } from "react";
import { TutorCardSkeleton } from "@/components/skeletons";
import { initAuthListener } from "@/lib/authListener";
import { useTheme } from "@/hooks/useTheme";
// ── Lazy-load all pages for performance (J4) ─────────────────
const WelcomePage = lazy(() => import("@/pages/Welcome"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const ChooseRolePage = lazy(() => import("@/pages/ChooseRolePage"));
const StudentOnboarding = lazy(() => import("@/pages/StudentOnboarding"));
const TutorOnboarding = lazy(() => import("@/pages/TutorOnboarding"));
const DiscoverPage = lazy(() => import("@/pages/Discover"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const TutorProfilePage = lazy(() => import("@/pages/TutorProfilePage"));
const SessionsPage = lazy(() => import("@/pages/SessionsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const TutorRequests = lazy(() => import("@/pages/TutorRequests"));
const TutorSchedule = lazy(() => import("@/pages/TutorSchedule"));
const TutorEarnings = lazy(() => import("@/pages/TutorEarnings"));
const TutorProfileSettings = lazy(() => import("@/pages/TutorProfileSettings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const SplashPage = lazy(() => import("@/pages/SplashPage"));
const DesignSystem = lazy(() => import("@/pages/DesignSystem"));
const SavedTutorsPage = lazy(() => import("@/pages/SavedTutorsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const MessageThreadPage = lazy(() => import("@/pages/MessageThreadPage"));
const OfflinePage = lazy(() => import("@/pages/OfflinePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

function PageSkeleton() {
  return (
    <div className="px-5 pt-14 pb-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <TutorCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Auth listener wiring ──────────────────────────────────────
function AuthListenerInit() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  useEffect(() => {
    return initAuthListener(navigate, qc);
  }, [navigate, qc]);
  return null;
}

// ── Theme initializer ─────────────────────────────────────────
function ThemeInit() {
  useTheme(); // applies theme class on mount
  return null;
}

const AppRoutes = () => {
  const { profile } = useAuth();
  const role = profile?.role;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <AuthListenerInit />
      <ThemeInit />
      <Routes>
        {/* ── Splash / first landing ───────────────────── */}
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/offline" element={<OfflinePage />} />

        {/* ── Public-only routes ───────────────────────── */}
        <Route path="/welcome" element={<PublicOnly><WelcomePage /></PublicOnly>} />
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />

        {/* ── Always-public ────────────────────────────── */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/design-system" element={<DesignSystem />} />

        {/* ── Role selection (authenticated but no role) ─ */}
        <Route path="/choose-role" element={
          <RequireAuth><ChooseRolePage /></RequireAuth>
        } />

        {/* ── Onboarding ──────────────────────────────── */}
        <Route path="/onboarding/student" element={
          <RequireAuth><StudentOnboarding /></RequireAuth>
        } />
        <Route path="/onboarding/tutor" element={
          <RequireAuth><TutorOnboarding /></RequireAuth>
        } />

        {/* ── Student routes ───────────────────────────── */}
        <Route path="/" element={
          <RequireAuth>
            <RequireRole role="student">
              <StudentLayout><ErrorBoundary compact><DiscoverPage /></ErrorBoundary></StudentLayout>
            </RequireRole>
          </RequireAuth>
        } />
        <Route path="/search" element={
          <RequireAuth>
            <StudentLayout><SearchPage /></StudentLayout>
          </RequireAuth>
        } />
        <Route path="/course/:id" element={
          <ErrorBoundary compact><CourseDetail /></ErrorBoundary>
        } />
        <Route path="/tutor/:id" element={
          <ErrorBoundary compact><TutorProfilePage /></ErrorBoundary>
        } />
        <Route path="/sessions" element={
          <RequireAuth>
            <StudentLayout><ErrorBoundary compact><SessionsPage /></ErrorBoundary></StudentLayout>
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <StudentLayout><ProfilePage /></StudentLayout>
          </RequireAuth>
        } />
        <Route path="/saved" element={
          <RequireAuth>
            <StudentLayout><SavedTutorsPage /></StudentLayout>
          </RequireAuth>
        } />
        <Route path="/messages" element={
          <RequireAuth>
            <StudentLayout><MessagesPage /></StudentLayout>
          </RequireAuth>
        } />
        <Route path="/messages/:id" element={
          <RequireAuth><MessageThreadPage /></RequireAuth>
        } />

        {/* ── Tutor routes ─────────────────────────────── */}
        <Route path="/tutor/requests" element={
          <RequireAuth>
            <RequireRole role="tutor">
              <TutorLayout><ErrorBoundary compact><TutorRequests /></ErrorBoundary></TutorLayout>
            </RequireRole>
          </RequireAuth>
        } />
        <Route path="/tutor/schedule" element={
          <RequireAuth>
            <RequireRole role="tutor">
              <TutorLayout><ErrorBoundary compact><TutorSchedule /></ErrorBoundary></TutorLayout>
            </RequireRole>
          </RequireAuth>
        } />
        <Route path="/tutor/earnings" element={
          <RequireAuth>
            <RequireRole role="tutor">
              <TutorLayout><TutorEarnings /></TutorLayout>
            </RequireRole>
          </RequireAuth>
        } />
        <Route path="/tutor/profile" element={
          <RequireAuth>
            <RequireRole role="tutor">
              <TutorLayout><TutorProfileSettings /></TutorLayout>
            </RequireRole>
          </RequireAuth>
        } />

        {/* ── Catch-all ────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OfflineBanner />
        <Sonner />
        <UniversityProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </UniversityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
