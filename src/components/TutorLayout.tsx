// ============================================================
// TutorLayout — Part 2.1
// Wraps tutor app pages. Floating BottomNav with 4 tutor tabs.
// ============================================================
import type { ReactNode } from "react";
import { Inbox, CalendarDays, DollarSign, User, MessageCircle } from "lucide-react";
import { BottomNav } from "./BottomNav";
import type { NavItem } from "./BottomNav";

const tutorNavItems: NavItem[] = [
  { label: "Inbox",     path: "/tutor/messages",  icon: MessageCircle },
  { label: "Requests",  path: "/tutor/requests",  icon: Inbox        },
  { label: "Schedule",  path: "/tutor/schedule",  icon: CalendarDays },
  { label: "Earnings",  path: "/tutor/earnings",  icon: DollarSign   },
  { label: "Profile",   path: "/tutor/profile",   icon: User         },
];

interface TutorLayoutProps {
  children: ReactNode;
}

export function TutorLayout({ children }: TutorLayoutProps) {
  return (
    <div className="relative min-h-svh flex flex-col bg-background">
      <main className="flex-1 flex flex-col pb-28">
        {children}
      </main>
      <BottomNav items={tutorNavItems} indicatorId="tutor-nav" />
    </div>
  );
}
