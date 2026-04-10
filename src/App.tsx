import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UniversityProvider } from "@/contexts/UniversityContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StudentLayout } from "@/components/StudentLayout";
import { TutorLayout } from "@/components/TutorLayout";

import WelcomePage from "@/pages/Welcome";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import StudentOnboarding from "@/pages/StudentOnboarding";
import TutorOnboarding from "@/pages/TutorOnboarding";
import DiscoverPage from "@/pages/Discover";
import SearchPage from "@/pages/SearchPage";
import CourseDetail from "@/pages/CourseDetail";
import TutorProfilePage from "@/pages/TutorProfilePage";
import SessionsPage from "@/pages/SessionsPage";
import ProfilePage from "@/pages/ProfilePage";
import TutorRequests from "@/pages/TutorRequests";
import TutorSchedule from "@/pages/TutorSchedule";
import TutorEarnings from "@/pages/TutorEarnings";
import TutorProfileSettings from "@/pages/TutorProfileSettings";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLoggedIn = !!user;
  const hasOnboarded = !!profile?.onboarded_at;
  const role = profile?.role ?? "student";

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/welcome" element={
        isLoggedIn && hasOnboarded ? <Navigate to="/" replace /> :
        isLoggedIn && !hasOnboarded ? <Navigate to="/choose-role" replace /> :
        <WelcomePage />
      } />
      <Route path="/login" element={
        isLoggedIn && hasOnboarded ? <Navigate to="/" replace /> :
        isLoggedIn && !hasOnboarded ? <Navigate to="/choose-role" replace /> :
        <LoginPage />
      } />
      <Route path="/signup" element={
        isLoggedIn && hasOnboarded ? <Navigate to="/" replace /> :
        isLoggedIn && !hasOnboarded ? <Navigate to="/choose-role" replace /> :
        <SignupPage />
      } />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfUse />} />

      {/* Role selection (logged in but not onboarded) */}
      <Route path="/choose-role" element={
        !isLoggedIn ? <Navigate to="/welcome" replace /> :
        hasOnboarded ? <Navigate to="/" replace /> :
        <WelcomePage />
      } />

      {/* Onboarding (must be logged in) */}
      <Route path="/onboarding/student" element={
        !isLoggedIn ? <Navigate to="/login" replace /> : <StudentOnboarding />
      } />
      <Route path="/onboarding/tutor" element={
        !isLoggedIn ? <Navigate to="/login" replace /> : <TutorOnboarding />
      } />

      {/* Student routes */}
      <Route path="/" element={
        !isLoggedIn ? <Navigate to="/welcome" replace /> :
        !hasOnboarded ? <Navigate to="/choose-role" replace /> :
        role === "tutor" ? <Navigate to="/tutor/requests" replace /> :
        <StudentLayout><DiscoverPage /></StudentLayout>
      } />
      <Route path="/search" element={
        !isLoggedIn ? <Navigate to="/login" replace /> :
        <StudentLayout><SearchPage /></StudentLayout>
      } />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/tutor/:id" element={<TutorProfilePage />} />
      <Route path="/sessions" element={
        !isLoggedIn ? <Navigate to="/login" replace /> :
        <StudentLayout><SessionsPage /></StudentLayout>
      } />
      <Route path="/profile" element={
        !isLoggedIn ? <Navigate to="/login" replace /> :
        <StudentLayout><ProfilePage /></StudentLayout>
      } />

      {/* Tutor routes */}
      <Route path="/tutor/requests" element={
        !isLoggedIn ? <Navigate to="/login" replace /> :
        <TutorLayout><TutorRequests /></TutorLayout>
      } />
      <Route path="/tutor/schedule" element={
        !isLoggedIn ? <Navigate to="/login" replace /> :
        <TutorLayout><TutorSchedule /></TutorLayout>
      } />
      <Route path="/tutor/earnings" element={
        !isLoggedIn ? <Navigate to="/login" replace /> :
        <TutorLayout><TutorEarnings /></TutorLayout>
      } />
      <Route path="/tutor/profile" element={
        !isLoggedIn ? <Navigate to="/login" replace /> :
        <TutorLayout><TutorProfileSettings /></TutorLayout>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
);

export default App;
