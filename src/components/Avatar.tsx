// ============================================================
// Avatar — Part 2.1
// With ring, DiceBear fallback for missing/broken avatars.
// ============================================================
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  ring?: boolean;
  className?: string;
}

function fallbackLetter(name: string): string {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() || "?";
}

export function Avatar({ src, name, size = 40, ring = false, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const displayName = name ?? "?";
  const useFallback = !src || imgError || src.includes("pravatar.cc");
  const avatarSrc = useFallback ? null : src;

  const style = { width: size, height: size, minWidth: size, minHeight: size };

  return (
    <div
      style={style}
      className={cn(
        "rounded-full flex-shrink-0 overflow-hidden bg-accent-light",
        ring && "ring-2 ring-accent ring-offset-2 ring-offset-background",
        className
      )}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={displayName}
          style={style}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          style={style}
          className="flex items-center justify-center bg-accent-light text-accent font-semibold"
          aria-label={displayName}
        >
          <span style={{ fontSize: size * 0.42 }}>{fallbackLetter(displayName)}</span>
        </div>
      )}
    </div>
  );
}
