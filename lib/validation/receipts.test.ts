import { describe, expect, it } from "vitest";
import { confirmedDocumentSchema, ocrProposalSchema, uploadInputSchema } from "./receipts";

const proposal = {
  supplier: "Synthetische Voorbeeldwinkel",
  documentDate: "2026-10-15",
  invoiceNumber: "SYN-2101",
  netAmount: "12.34",
  vatAmount: "2.59",
  grossAmount: "14.93",
  vatTreatment: "standard",
};

describe("receipt validation schemas", () => {
  it("accepts supported upload metadata only within the size limit", () => {
    expect(uploadInputSchema.safeParse({ type: "image/jpeg", size: 1 }).success).toBe(true);
    expect(uploadInputSchema.safeParse({ type: "text/plain", size: 1 }).success).toBe(false);
    expect(uploadInputSchema.safeParse({ type: "application/pdf", size: 15 * 1024 * 1024 + 1 }).success).toBe(false);
    expect(uploadInputSchema.safeParse({ type: "application/pdf", size: 0 }).success).toBe(false);
  });

  it("accepts proposal money as decimal strings and rejects numbers/floats", () => {
    expect(ocrProposalSchema.safeParse(proposal).success).toBe(true);
    expect(ocrProposalSchema.safeParse({ ...proposal, netAmount: 12.34 }).success).toBe(false);
    expect(ocrProposalSchema.safeParse({ ...proposal, vatAmount: "2.599" }).success).toBe(false);
  });

  it("rejects invalid dates and unknown VAT treatments", () => {
    expect(ocrProposalSchema.safeParse({ ...proposal, documentDate: "2026-02-30" }).success).toBe(false);
    expect(ocrProposalSchema.safeParse({ ...proposal, vatTreatment: "unknown" }).success).toBe(false);
  });

  it("validates confirmed data and defaults currency to EUR", () => {
    expect(confirmedDocumentSchema.parse(proposal).currencyCode).toBe("EUR");
    expect(confirmedDocumentSchema.safeParse({ ...proposal, grossAmount: "-1.00" }).success).toBe(false);
  });
});
