import { describe, expect, it } from "vitest";
import manifest from "../../fixtures/synthetic/receipts.json";
import { calculateTotals, roundDecimalToCents, type SyntheticReceiptFixture } from "../../scripts/fixture-math.mjs";

const fixtures = manifest.fixtures as SyntheticReceiptFixture[];
const money = /^\d+\.\d{2}$/;
const decimal = /^\d+\.\d{2,3}$/;

describe("synthetic receipt fixture manifest", () => {
  it("contains at least ten uniquely named, synthetic fixtures with the required fields", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(10);
    expect(new Set(fixtures.map((fixture) => fixture.id)).size).toBe(fixtures.length);
    for (const fixture of fixtures) {
      expect(fixture.id).toMatch(/^[a-z0-9-]+$/);
      expect(fixture.leverancier).toMatch(/^Synthetische|^Demo|^Fictieve/);
      expect(fixture.datum).toMatch(/^2026-\d{2}-\d{2}$/);
      expect(fixture.factuurnummer).toMatch(/^SYN-/);
      expect(fixture.regels.length).toBeGreaterThan(0);
      for (const amount of [fixture.verwacht_netto, fixture.verwacht_btw, fixture.verwacht_totaal]) {
        expect(typeof amount).toBe("string");
        expect(amount).toMatch(money);
      }
      for (const line of fixture.regels) {
        expect(line.omschrijving.length).toBeGreaterThan(0);
        expect(line.aantal).toMatch(money);
        expect(line.eenheidsprijs).toMatch(decimal);
        expect(line.tarief).toMatch(money);
        expect(typeof line.btw_code).toBe("string");
      }
    }
  });

  it("recomputes every fixture total using exact integer-cent math", () => {
    for (const fixture of fixtures) {
      const actual = calculateTotals(fixture);
      expect(actual.netto, `${fixture.id}: expected net total`).toBe(fixture.verwacht_netto);
      expect(actual.btw, `${fixture.id}: expected VAT total`).toBe(fixture.verwacht_btw);
      expect(actual.totaal, `${fixture.id}: expected gross total`).toBe(fixture.verwacht_totaal);
    }
  });

  it("covers the required VAT and rounding cases", () => {
    const codes = new Set(fixtures.flatMap((fixture) => fixture.regels.map((line) => line.btw_code)));
    expect([...codes]).toEqual(expect.arrayContaining(["standaard", "nultarief", "vrijgesteld", "verlegd", "kor"]));
    expect(fixtures.some((fixture) => fixture.regels.length > 1)).toBe(true);
    expect(fixtures.some((fixture) => new Set(fixture.regels.map((line) => line.tarief)).size > 1)).toBe(true);
    expect(fixtures.some((fixture) => fixture.regels.some((line) => line.eenheidsprijs === "0.335"))).toBe(true);
    for (const rounding of manifest.afrondingsgevallen) {
      expect(typeof rounding.bedrag).toBe("string");
      expect(roundDecimalToCents(rounding.bedrag)).toBe(rounding.verwacht);
    }
    expect(manifest.te_groot_bestand.bytes).toBe("15728641");
    expect(manifest.maximale_upload_bytes).toBe("15728640");
  });
});
