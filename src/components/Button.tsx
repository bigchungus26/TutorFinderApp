// ============================================================
// Button — Part 2.1
// Three variants: primary (accent fill), secondary (outline),
// ghost (text only). Spring press. 48px minimum height.
// ============================================================
import { motion } from "framer-motion";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover font-semibold",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-muted active:bg-muted font-medium",
  ghost:
    "bg-transparent text-foreground hover:bg-muted active:bg-muted font-medium",
  danger:
    "bg-error text-white hover:opacity-90 active:opacity-80 font-semibold",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 rounded-lg text-body-sm gap-1.5",
  md: "h-12 px-5 rounded-xl text-body gap-2",
  lg: "h-14 px-6 rounded-xl text-body-lg gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={springs.snappy}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center transition-colors duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...(props as any)}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full inline-block"
          aria-hidden="true"
        />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
}
