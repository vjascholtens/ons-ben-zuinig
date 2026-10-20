import { describe, expect, it } from "vitest";
import fixtureManifest from "../../fixtures/synthetic/receipts.json";
import { ocrProposalSchema } from "@/lib/validation/schemas";
import { getSyntheticMockOcrProposal, syntheticMockOcrFixtures } from "./mock-ocr";

describe("fixture-backed mock OCR", () => {
  it("returns a deterministic proposal for a known fixture ID", () => {
    const first = getSyntheticMockOcrProposal("btw-21-een-regel");
    const second = getSyntheticMockOcrProposal("btw-21-een-regel");
    expect(first).not.toBeNull();
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      fixtureId: "btw-21-een-regel",
      supplier: "Synthetische Voorbeeldwinkel Noord",
      documentDate: "2026-10-15",
      invoiceNumber: "SYN-2101",
      netAmount: "12.34",
      vatAmount: "2.59",
      grossAmount: "14.93",
      vatTreatment: "standard",
      currencyCode: "EUR",
    });
  });

  it("maps each fixture to a schema-valid proposal without calling an OCR provider", () => {
    expect(syntheticMockOcrFixtures).toHaveLength(fixtureManifest.fixtures.length);
    for (const fixture of fixtureManifest.fixtures) {
      const proposal = getSyntheticMockOcrProposal(fixture.id);
      expect(ocrProposalSchema.safeParse(proposal).success).toBe(true);
      expect(proposal?.fixtureId).toBe(fixture.id);
    }
  });

  it("rejects fixture IDs that are not in the committed synthetic manifest", () => {
    expect(getSyntheticMockOcrProposal("https://example.invalid/ocr")).toBeNull();
    expect(getSyntheticMockOcrProposal("../real-receipt")).toBeNull();
  });
});
