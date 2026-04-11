import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StudentLayout } from "@/components/StudentLayout";
import { TutorLayout } from "@/components/TutorLayout";

interface RoleAwareLayoutProps {
  children: ReactNode;
}

export function RoleAwareLayout({ children }: RoleAwareLayoutProps) {
  const { profile } = useAuth();

  if (profile?.role === "tutor") {
    return <TutorLayout>{children}</TutorLayout>;
  }

  return <StudentLayout>{children}</StudentLayout>;
}
