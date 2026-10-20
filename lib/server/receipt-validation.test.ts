import { describe, expect, it } from "vitest";
import { detectAllowedReceiptType, MAX_RECEIPT_FILE_BYTES } from "./receipt-validation";

describe("detectAllowedReceiptType", () => {
  it("recognizes PDF content from its binary signature", async () => {
    const bytes = Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\n", "utf8");
    await expect(detectAllowedReceiptType(bytes)).resolves.toEqual({
      mime: "application/pdf",
      extension: "pdf",
    });
  });

  it("rejects an HTML file even if a client might name it .pdf", async () => {
    const bytes = Buffer.from("<!doctype html><html><body>not a receipt</body></html>", "utf8");
    await expect(detectAllowedReceiptType(bytes)).resolves.toBeNull();
  });

  it("rejects empty content", async () => {
    await expect(detectAllowedReceiptType(Buffer.alloc(0))).resolves.toBeNull();
  });

  it("rejects over-limit content before type detection", async () => {
    await expect(
      detectAllowedReceiptType(new Uint8Array(MAX_RECEIPT_FILE_BYTES + 1)),
    ).resolves.toBeNull();
  });
});
