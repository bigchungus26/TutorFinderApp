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

function dicebearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ecfdf5,fef9ee,e0f2fe&fontFamily=serif&fontSize=42`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = 40, ring = false, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const displayName = name ?? "?";
  // Use dicebear for missing/broken images OR pravatar placeholders
  const useFallback = !src || imgError || src.includes("pravatar.cc");
  const avatarSrc = useFallback ? (name ? dicebearUrl(name) : null) : src;

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
        >
          <span style={{ fontSize: size * 0.36 }}>{initials(displayName)}</span>
        </div>
      )}
    </div>
  );
}
