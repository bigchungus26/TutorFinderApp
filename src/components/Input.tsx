// ============================================================
// Input — Part 2.1
// 16px font (prevents iOS zoom). Floating label. Focus ring.
// Error state with shake animation.
// ============================================================
import { useState, type InputHTMLAttributes, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Right side slot (e.g. show/hide button for password) */
  right?: React.ReactNode;
  wrapperClassName?: string;
}

const shakeKeyframes = { x: [0, -4, 4, -4, 4, 0] };

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  right,
  wrapperClassName,
  className,
  id,
  placeholder,
  value,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasValue = value !== undefined ? Boolean(value) : undefined;

  return (
    <div className={cn("relative", wrapperClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "block text-caption mb-1.5 font-medium transition-colors",
            error ? "text-error" : focused ? "text-accent" : "text-ink-muted"
          )}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <motion.div
        animate={error ? shakeKeyframes : {}}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="relative"
      >
        <input
          ref={ref}
          id={inputId}
          placeholder={placeholder ?? (label ? `Enter ${label.toLowerCase()}` : "")}
          value={value}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
          className={cn(
            // Base styles — 16px prevents iOS zoom
            "w-full text-[16px] leading-[1.5] bg-surface text-foreground",
            "placeholder:text-ink-subtle",
            "border border-border rounded-xl",
            "px-4 py-3.5",
            "transition-all duration-150",
            "focus:outline-none",
            // Focus ring
            focused && !error && "border-accent ring-2 ring-accent ring-offset-0 ring-opacity-20",
            // Error state
            error && "border-error ring-2 ring-error ring-offset-0 ring-opacity-20",
            // Right slot padding
            right && "pr-12",
            className
          )}
          style={{ fontSize: "16px" }} // explicit override for iOS
          {...props}
        />

        {/* Right slot */}
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {right}
          </div>
        )}
      </motion.div>

      {/* Error / hint */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 text-caption text-error"
            role="alert"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-caption text-ink-subtle"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = "Input";
