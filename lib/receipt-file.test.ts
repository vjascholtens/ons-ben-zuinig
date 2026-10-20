import { describe, expect, it } from "vitest";
import { formatFileSize, getReceiptFileError, MAX_RECEIPT_FILE_BYTES } from "./receipt-file";

describe("getReceiptFileError", () => {
  it("accepts a PDF receipt", () => {
    expect(getReceiptFileError({ name: "bonnetje.pdf", type: "application/pdf", size: 2048 })).toBeNull();
  });

  it("accepts a phone photo with a generic MIME type", () => {
    expect(getReceiptFileError({ name: "IMG_0001.HEIC", type: "application/octet-stream", size: 2048 })).toBeNull();
  });

  it("rejects files larger than the client-side limit", () => {
    expect(getReceiptFileError({ name: "bonnetje.jpg", type: "image/jpeg", size: MAX_RECEIPT_FILE_BYTES + 1 })).toContain("15 MB");
  });

  it("rejects unsupported file types", () => {
    expect(getReceiptFileError({ name: "script.js", type: "text/javascript", size: 512 })).toContain("afbeelding of PDF");
  });

  it("rejects empty files", () => {
    expect(getReceiptFileError({ name: "empty.pdf", type: "application/pdf", size: 0 })).toContain("leeg");
  });
});

describe("formatFileSize", () => {
  it("formats bytes and megabytes", () => {
    expect(formatFileSize(256)).toBe("256 B");
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
  });
});
