import { describe, expect, it } from "vitest";
import {
  confirmedDocumentDataSchema,
  MAX_RECEIPT_FILE_BYTES,
  ocrProposalSchema,
  uploadInputSchema,
  uploadSizeSchema,
} from "./schemas";

const proposal = {
  fixtureId: "vat-21-demo",
  supplier: "Synthetische voorbeeldwinkel",
  documentDate: "2026-10-15",
  invoiceNumber: "SYN-001",
  netAmount: "12.34",
  vatAmount: "2.59",
  grossAmount: "14.93",
  vatTreatment: "standard",
  vatRate: "21.00",
  currencyCode: "EUR",
};

describe("server input schemas", () => {
  it("allows only supported MIME types and files up to 15 MiB", () => {
    expect(uploadInputSchema.safeParse({ contentType: "application/pdf", size: 128 }).success).toBe(true);
    expect(uploadInputSchema.safeParse({ contentType: "image/jpeg", size: MAX_RECEIPT_FILE_BYTES }).success).toBe(true);
    expect(uploadInputSchema.safeParse({ contentType: "text/html", size: 128 }).success).toBe(false);
    expect(uploadInputSchema.safeParse({ contentType: "application/pdf", size: MAX_RECEIPT_FILE_BYTES + 1 }).success).toBe(false);
    expect(uploadSizeSchema.safeParse(0).success).toBe(false);
    expect(uploadSizeSchema.safeParse(1.5).success).toBe(false);
  });

  it("validates OCR suggestions and keeps all money values as decimal strings", () => {
    expect(ocrProposalSchema.safeParse(proposal).success).toBe(true);
    expect(ocrProposalSchema.safeParse({ ...proposal, netAmount: 12.34 }).success).toBe(false);
    expect(ocrProposalSchema.safeParse({ ...proposal, netAmount: "1e3" }).success).toBe(false);
    expect(ocrProposalSchema.safeParse({ ...proposal, vatTreatment: "guess" }).success).toBe(false);
    expect(ocrProposalSchema.safeParse({ ...proposal, documentDate: "2026-02-30" }).success).toBe(false);
    expect(ocrProposalSchema.safeParse({ ...proposal, supplier: "   " }).success).toBe(false);
  });

  it("validates confirmed document data independently from the OCR proposal", () => {
    const confirmed = Object.fromEntries(Object.entries(proposal).filter(([key]) => key !== "fixtureId" && key !== "vatRate"));
    const parsed = confirmedDocumentDataSchema.safeParse(confirmed);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.currencyCode).toBe("EUR");
    expect(confirmedDocumentDataSchema.safeParse({ ...confirmed, currencyCode: "Euro" }).success).toBe(false);
    expect(confirmedDocumentDataSchema.safeParse({ ...confirmed, grossAmount: "14.9.3" }).success).toBe(false);
  });
});
