import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function CountUp({
  value,
  prefix,
  suffix,
  decimals = 0,
  duration = 800,
  className,
}: CountUpProps) {
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const motionValue = useMotionValue(reducedMotion.current ? value : 0);

  const displayed = useTransform(motionValue, (latest) => {
    const formatted = latest.toFixed(decimals);
    return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
  });

  useEffect(() => {
    if (reducedMotion.current) {
      motionValue.set(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: duration / 1000,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [value, duration, motionValue]);

  return <motion.span className={className}>{displayed}</motion.span>;
}
