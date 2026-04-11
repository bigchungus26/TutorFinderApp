// ============================================================
// StudentLayout — Part 2.1
// Wraps student app pages. Floating BottomNav with 4 tabs.
// ============================================================
import type { ReactNode } from "react";
import { Compass, Search, Calendar, User } from "lucide-react";
import { BottomNav } from "./BottomNav";
import type { NavItem } from "./BottomNav";

const studentNavItems: NavItem[] = [
  { label: "Discover", path: "/discover",  icon: Compass  },
  { label: "Search",   path: "/search",    icon: Search   },
  { label: "Sessions", path: "/sessions",  icon: Calendar },
  { label: "Profile",  path: "/profile",   icon: User     },
];

interface StudentLayoutProps {
  children: ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="relative min-h-svh flex flex-col bg-background">
      <main className="flex-1 flex flex-col pb-28">
        {children}
      </main>
      <BottomNav items={studentNavItems} indicatorId="student-nav" />
    </div>
  );
}
