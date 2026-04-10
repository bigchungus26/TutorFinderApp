import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UniversityProvider } from "@/contexts/UniversityContext";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { StudentLayout } from "@/components/StudentLayout";
import { TutorLayout } from "@/components/TutorLayout";

import WelcomePage from "@/pages/Welcome";
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

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { role, hasOnboarded } = useRole();

  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/onboarding/student" element={<StudentOnboarding />} />
      <Route path="/onboarding/tutor" element={<TutorOnboarding />} />

      {/* Student routes */}
      <Route path="/" element={
        !hasOnboarded ? <Navigate to="/welcome" replace /> :
        role === "tutor" ? <Navigate to="/tutor/requests" replace /> :
        <StudentLayout><DiscoverPage /></StudentLayout>
      } />
      <Route path="/search" element={<StudentLayout><SearchPage /></StudentLayout>} />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/tutor/:id" element={<TutorProfilePage />} />
      <Route path="/sessions" element={<StudentLayout><SessionsPage /></StudentLayout>} />
      <Route path="/profile" element={<StudentLayout><ProfilePage /></StudentLayout>} />

      {/* Tutor routes */}
      <Route path="/tutor/requests" element={<TutorLayout><TutorRequests /></TutorLayout>} />
      <Route path="/tutor/schedule" element={<TutorLayout><TutorSchedule /></TutorLayout>} />
      <Route path="/tutor/earnings" element={<TutorLayout><TutorEarnings /></TutorLayout>} />
      <Route path="/tutor/profile" element={<TutorLayout><TutorProfileSettings /></TutorLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <UniversityProvider>
        <RoleProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RoleProvider>
      </UniversityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
