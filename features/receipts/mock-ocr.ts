import fixtureManifest from "../../fixtures/synthetic/receipts.json";
import { ocrProposalSchema, type OcrProposal } from "@/lib/validation/schemas";

const vatTreatments: Record<string, OcrProposal["vatTreatment"]> = {
  standaard: "standard",
  nultarief: "zero_rate",
  vrijgesteld: "exempt",
  verlegd: "reverse_charge",
  kor: "kor",
};

type Fixture = (typeof fixtureManifest.fixtures)[number];

export function getSyntheticMockOcrProposal(fixtureId: string): OcrProposal | null {
  const fixture: Fixture | undefined = fixtureManifest.fixtures.find((item) => item.id === fixtureId);
  if (!fixture) return null;

  const firstLine = fixture.regels[0];
  const parsed = ocrProposalSchema.safeParse({
    fixtureId: fixture.id,
    supplier: fixture.leverancier,
    documentDate: fixture.datum,
    invoiceNumber: fixture.factuurnummer,
    netAmount: fixture.verwacht_netto,
    vatAmount: fixture.verwacht_btw,
    grossAmount: fixture.verwacht_totaal,
    vatTreatment: vatTreatments[firstLine?.btw_code ?? "standaard"] ?? "standard",
    vatRate: firstLine?.tarief ?? "0.00",
    currencyCode: "EUR",
  });
  return parsed.success ? parsed.data : null;
}

export const syntheticMockOcrFixtures = fixtureManifest.fixtures.map(({ id, leverancier }) => ({
  id,
  label: `${leverancier} · ${id}`,
}));
