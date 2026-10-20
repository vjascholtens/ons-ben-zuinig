import { describe, expect, it } from "vitest";
import { calculateTotals, roundDecimalToCents, type SyntheticVatCode } from "../../scripts/fixture-math.mjs";

const line = (eenheidsprijs: string, tarief = "21.00", btw_code: SyntheticVatCode = "standaard") => ({
  omschrijving: "Synthetische testregel",
  aantal: "1.00",
  eenheidsprijs,
  tarief,
  btw_code,
});

describe("receipt amount and VAT calculation boundaries", () => {
  it("rounds decimal strings half-up without binary floating-point", () => {
    expect(roundDecimalToCents("0.335")).toBe("0.34");
    expect(roundDecimalToCents("0.334")).toBe("0.33");
    expect(roundDecimalToCents("1.005")).toBe("1.01");
    expect(() => roundDecimalToCents("0.0001")).toThrow();
    expect(() => roundDecimalToCents(0.335 as unknown as string)).toThrow();
  });

  it("calculates 9% and 21% VAT separately for each line", () => {
    const result = calculateTotals({
      regels: [line("10.00", "21.00"), line("5.00", "9.00")],
    });
    expect(result).toEqual({ netto: "15.00", btw: "2.55", totaal: "17.55" });
  });

  it("does not calculate VAT for zero-rated, exempt, reverse-charge, or KOR lines", () => {
    for (const code of ["nultarief", "vrijgesteld", "verlegd", "kor"]) {
      expect(calculateTotals({ regels: [line("10.00", "0.00", code)] })).toEqual({
        netto: "10.00",
        btw: "0.00",
        totaal: "10.00",
      });
    }
  });

  it("rejects invalid rates, negative values, empty line sets, and unknown VAT codes", () => {
    expect(() => calculateTotals({ regels: [line("10.00", "20.00")] })).toThrow();
    expect(() => calculateTotals({ regels: [line("-1.00")] })).toThrow();
    expect(() => calculateTotals({ regels: [] })).toThrow();
    expect(() => calculateTotals({ regels: [line("10.00", "0.00", "unknown")] })).toThrow();
  });
});
