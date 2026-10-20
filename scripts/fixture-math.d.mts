export type SyntheticVatCode = "standaard" | "nultarief" | "vrijgesteld" | "verlegd" | "kor";
export type SyntheticReceiptLine = {
  omschrijving: string;
  aantal: string;
  eenheidsprijs: string;
  btw_code: SyntheticVatCode;
  tarief: string;
};
export type SyntheticReceiptFixture = {
  id: string;
  leverancier: string;
  datum: string;
  factuurnummer: string;
  regels: SyntheticReceiptLine[];
  verwacht_netto: string;
  verwacht_btw: string;
  verwacht_totaal: string;
};
export function formatCents(cents: bigint): string;
export function roundDecimalToCents(value: string): string;
export function calculateTotals(fixture: Pick<SyntheticReceiptFixture, "regels">): {
  netto: string;
  btw: string;
  totaal: string;
};
