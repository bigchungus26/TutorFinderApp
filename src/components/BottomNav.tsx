// ============================================================
// BottomNav — Part 2.1
// Floating pill, 4 tabs, layoutId sliding indicator,
// outline/filled icon swap on active. Safe-area aware.
// ============================================================
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { springs } from "@/lib/motion";
import type { ElementType } from "react";

export interface NavItem {
  label: string;
  path: string;
  icon: ElementType;
  activeIcon?: ElementType;
}

interface BottomNavProps {
  items: NavItem[];
  /** Optional indicatorId for layoutId — use unique value per nav instance */
  indicatorId?: string;
}

export function BottomNav({ items, indicatorId = "bottom-nav-indicator" }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div
        className="flex items-center gap-1 bg-surface border border-border rounded-pill px-2 py-2 shadow-md"
        style={{ maxWidth: 440 }}
      >
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center justify-center px-4 py-2 rounded-full min-w-[60px] min-h-[44px]"
            >
              {/* Sliding background indicator */}
              {isActive && (
                <motion.div
                  layoutId={indicatorId}
                  className="absolute inset-0 rounded-full bg-accent-light"
                  transition={springs.smooth}
                />
              )}

              {/* Icon */}
              <span className="relative z-10">
                <Icon
                  size={22}
                  className={isActive ? "text-accent" : "text-ink-muted"}
                  aria-hidden="true"
                />
              </span>

              {/* Label */}
              <span
                className={`relative z-10 text-label mt-0.5 ${
                  isActive ? "text-accent font-semibold" : "text-ink-muted"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
