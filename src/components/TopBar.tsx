// ============================================================
// TopBar — Part 2.1
// Reusable top navigation bar.
// Props: title, back button, right action slot.
// ============================================================
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { springs } from "@/lib/motion";

interface TopBarProps {
  title?: string;
  /** Show back arrow; if string, navigates to that path; if true, go(-1) */
  back?: boolean | string;
  onBack?: () => void;
  right?: ReactNode;
  /** Extra classes on the header element */
  className?: string;
  /** Transparent background (for pages with full-bleed hero) */
  transparent?: boolean;
}

export function TopBar({
  title,
  back,
  onBack,
  right,
  className = "",
  transparent = false,
}: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (typeof back === "string") { navigate(back); return; }
    navigate(-1);
  };

  return (
    <header
      className={`flex items-center justify-between px-4 pt-12 pb-3 ${
        transparent ? "" : "bg-background"
      } ${className}`}
    >
      {/* Left slot */}
      {back ? (
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={springs.snappy}
          onClick={handleBack}
          aria-label="Go back"
          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-muted transition-colors -ml-2"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </motion.button>
      ) : (
        <div className="w-11" />
      )}

      {/* Title */}
      {title && (
        <h1 className="text-display-sm text-foreground flex-1 text-center px-2 truncate">
          {title}
        </h1>
      )}

      {/* Right slot */}
      {right ? (
        <div className="w-11 flex items-center justify-end">{right}</div>
      ) : (
        <div className="w-11" />
      )}
    </header>
  );
}
