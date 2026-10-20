import { fileTypeFromBuffer } from "file-type";

export const MAX_RECEIPT_FILE_BYTES = 15 * 1024 * 1024;

const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
};

export type DetectedReceiptType = {
  mime: string;
  extension: string;
};

export async function detectAllowedReceiptType(
  bytes: Uint8Array,
): Promise<DetectedReceiptType | null> {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_RECEIPT_FILE_BYTES) {
    return null;
  }

  const detected = await fileTypeFromBuffer(bytes);
  if (!detected) return null;

  const extension = ALLOWED_MIME_EXTENSIONS[detected.mime];
  if (!extension) return null;

  return { mime: detected.mime, extension };
}
