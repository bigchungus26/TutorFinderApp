import { supabase } from "@/lib/supabase";

export const PROFILE_AVATAR_BUCKET = "profile-avatars";
export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_AVATAR_ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function isAllowedProfileAvatarType(type: string) {
  return (PROFILE_AVATAR_ALLOWED_TYPES as readonly string[]).includes(type);
}

export function extractProfileAvatarPath(url: string | null | undefined) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  return url.slice(markerIndex + marker.length);
}

export async function uploadProfileAvatar(userId: string, file: File) {
  if (!userId) {
    throw new Error("You need to be signed in to upload a profile photo.");
  }

  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    throw new Error("Profile photos must be under 5 MB.");
  }

  if (!isAllowedProfileAvatarType(file.type)) {
    throw new Error("Only PNG, JPEG, and WebP profile photos are supported.");
  }

  const path = `${userId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Couldn't upload that profile photo.");
  }

  const { data } = supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

export async function deleteProfileAvatarByUrl(url: string | null | undefined) {
  const path = extractProfileAvatarPath(url);
  if (!path) return;

  const { error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .remove([path]);

  if (error) {
    console.warn("Profile avatar cleanup failed:", error.message);
  }
}
