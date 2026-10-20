import { describe, expect, it } from "vitest";
import { calculateLineVat, roundToCents } from "./money";

describe("exact money helpers", () => {
  it("uses official-style half-up cent rounding without binary floating point", () => {
    expect(roundToCents("20.124")).toBe("20.12");
    expect(roundToCents("20.125")).toBe("20.13");
  });

  it("rounds VAT per invoice line using decimal-string inputs", () => {
    expect(calculateLineVat("100.00", "21.00")).toBe("21.00");
    expect(calculateLineVat("100.00", "9.00")).toBe("9.00");
    expect(calculateLineVat("0.50", "21.00")).toBe("0.11");
    expect(calculateLineVat("0.30", "21.00")).toBe("0.06");
  });

  it("rejects floating point numbers and excessive input precision", () => {
    expect(() => calculateLineVat("1.001", "21.00")).toThrow();
    expect(() => calculateLineVat("1.00", "21.001")).toThrow();
    expect(() => roundToCents("NaN")).toThrow();
  });
});
