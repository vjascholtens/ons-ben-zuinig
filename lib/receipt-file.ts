export const MAX_RECEIPT_FILE_BYTES = 15 * 1024 * 1024;

export type ReceiptFileLike = Pick<File, "name" | "size" | "type">;

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif",
]);
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

/**
 * Client-side usability check only. The API repeats validation using binary
 * file signatures and storage policies. This function is not an auth control.
 */
export function getReceiptFileError(file: ReceiptFileLike): string | null {
  if (file.size <= 0) return "Dit bestand lijkt leeg. Kies een andere foto of PDF.";
  if (file.size > MAX_RECEIPT_FILE_BYTES) {
    return "Dit bestand is groter dan 15 MB. Kies een kleinere foto of PDF.";
  }

  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  const supportedByName = ALLOWED_EXTENSIONS.has(extension);
  const supportedByMime = ALLOWED_MIMES.has(file.type);

  if (!supportedByName && !supportedByMime) {
    return "Kies een geldige PDF of ondersteunde foto. Andere bestandstypen worden niet ondersteund.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
