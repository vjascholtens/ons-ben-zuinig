export const MAX_RECEIPT_FILE_BYTES = 15 * 1024 * 1024;

export type ReceiptFileLike = Pick<File, "name" | "size" | "type">;

/**
 * Client-side usability check only. Any future upload endpoint must repeat
 * type/size validation server-side and inspect actual file contents.
 */
export function getReceiptFileError(file: ReceiptFileLike): string | null {
  if (file.size <= 0) return "Dit bestand lijkt leeg. Kies een andere foto of PDF.";
  if (file.size > MAX_RECEIPT_FILE_BYTES) {
    return "Dit bestand is groter dan 15 MB. Kies een kleinere foto of PDF.";
  }

  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif"];
  const allowedExtensions = new Set([".pdf", ...imageExtensions]);
  const looksLikeImage = file.type.startsWith("image/") || imageExtensions.includes(extension);
  const looksLikePdf = file.type === "application/pdf" || extension === ".pdf";

  if (!looksLikeImage && !looksLikePdf) {
    return "Kies een afbeelding of PDF. Andere bestandstypen worden niet ondersteund.";
  }
  if (extension && !allowedExtensions.has(extension) && !file.type.startsWith("image/") && file.type !== "application/pdf") {
    return "Dit bestandstype wordt niet ondersteund.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
