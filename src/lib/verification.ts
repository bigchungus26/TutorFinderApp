// ============================================================
// Verification helpers
// Shared utilities for the tutor verification flow.
// ============================================================
import { supabase } from "@/lib/supabase";
import type { VerificationDocType, VerificationDocument } from "@/types/database";

export const VERIFICATION_BUCKET = "verification-documents";
export const VERIFICATION_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const VERIFICATION_ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;

export type VerificationUploadResult = {
  document: VerificationDocument;
  publicPreviewUrl: string | null;
};

export class VerificationUploadError extends Error {
  code:
    | "too_large"
    | "bad_mime"
    | "upload_failed"
    | "row_failed"
    | "not_authenticated";
  constructor(
    code: VerificationUploadError["code"],
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function isAllowedVerificationMime(mime: string) {
  return (VERIFICATION_ALLOWED_MIME as readonly string[]).includes(mime);
}

export async function uploadVerificationDocument(params: {
  userId: string;
  file: File;
  docType: VerificationDocType;
}): Promise<VerificationUploadResult> {
  const { userId, file, docType } = params;

  if (!userId) {
    throw new VerificationUploadError(
      "not_authenticated",
      "You need to be signed in to upload verification documents.",
    );
  }
  if (file.size > VERIFICATION_MAX_BYTES) {
    throw new VerificationUploadError(
      "too_large",
      "File is over 10 MB. Please upload a smaller copy.",
    );
  }
  if (!isAllowedVerificationMime(file.type)) {
    throw new VerificationUploadError(
      "bad_mime",
      "Only PNG, JPEG, and PDF files are accepted.",
    );
  }

  const stamp = Date.now();
  const path = `${userId}/${stamp}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
  if (uploadError) {
    throw new VerificationUploadError(
      "upload_failed",
      uploadError.message || "Couldn't upload that file.",
    );
  }

  const { data: row, error: rowError } = await supabase
    .from("verification_documents")
    .insert({
      tutor_id: userId,
      doc_type: docType,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("*")
    .single();

  if (rowError || !row) {
    // best-effort cleanup
    await supabase.storage.from(VERIFICATION_BUCKET).remove([path]);
    throw new VerificationUploadError(
      "row_failed",
      rowError?.message || "Couldn't save the document reference.",
    );
  }

  // Bucket is private; we don't generate public URLs by default.
  return { document: row as VerificationDocument, publicPreviewUrl: null };
}

export async function listMyVerificationDocuments(userId: string) {
  const { data, error } = await supabase
    .from("verification_documents")
    .select("*")
    .eq("tutor_id", userId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VerificationDocument[];
}

export async function deleteVerificationDocument(doc: VerificationDocument) {
  const { error: storageError } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .remove([doc.storage_path]);
  if (storageError) {
    // continue — row delete still useful
    console.warn("Storage cleanup failed:", storageError.message);
  }
  const { error } = await supabase
    .from("verification_documents")
    .delete()
    .eq("id", doc.id);
  if (error) throw error;
}

export async function createSignedVerificationUrl(
  storagePath: string,
  ttlSeconds = 60 * 10,
) {
  const { data, error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .createSignedUrl(storagePath, ttlSeconds);
  if (error) throw error;
  return data?.signedUrl ?? null;
}

export const VERIFICATION_DOC_LABELS: Record<VerificationDocType, string> = {
  student_id: "Student ID",
  transcript: "Transcript",
  enrollment_proof: "Enrollment proof",
  diploma: "Diploma",
  employer_letter: "Employer letter",
  license: "Professional license",
  other: "Other",
};

export const STUDENT_TRACK_DOC_TYPES: VerificationDocType[] = [
  "student_id",
  "transcript",
  "enrollment_proof",
];

export const NON_STUDENT_TRACK_DOC_TYPES: VerificationDocType[] = [
  "diploma",
  "employer_letter",
  "license",
  "other",
];

export type VerificationGate = "approved" | "pending" | "rejected" | "none";

export function gateForProfile(profile: {
  role: string;
  verification_status: string | null;
} | null | undefined): VerificationGate {
  if (!profile || profile.role !== "tutor") return "none";
  if (profile.verification_status === "approved") return "approved";
  if (profile.verification_status === "rejected") return "rejected";
  return "pending";
}
