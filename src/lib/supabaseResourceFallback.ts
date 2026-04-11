const missingResources = new Set<string>();

export function isMissingSupabaseResourceError(error: any) {
  const message = String(error?.message ?? "");

  return (
    error?.code === "PGRST205" ||
    error?.status === 404 ||
    message.includes("Could not find the table") ||
    message.includes("schema cache")
  );
}

export function markSupabaseResourceMissing(resource: string) {
  if (!resource) return;
  missingResources.add(resource);
}

export function isSupabaseResourceMissing(resource: string) {
  return missingResources.has(resource);
}
