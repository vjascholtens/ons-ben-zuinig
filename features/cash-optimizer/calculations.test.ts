import { describe, expect, it } from "vitest";
import {
  addBusinessDays,
  addCalendarDays,
  calculateDpo,
  calculateDso,
  calculateDueDate,
  calculateLatestRecommendedPaymentDate,
  evaluateEarlyPaymentDiscount,
  getNetherlandsPublicHolidays,
  isNetherlandsBusinessDay,
  subtractBusinessDays,
} from "./calculations";

describe("cash optimizer date calculations", () => {
  it("adds calendar days across month and year boundaries without local timezone dependence", () => {
    expect(addCalendarDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addCalendarDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addCalendarDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("validates ISO dates and day counts", () => {
    expect(() => addCalendarDays("2026-02-29", 1)).toThrow();
    expect(() => addCalendarDays("1899-12-31", 1)).toThrow();
    expect(() => calculateDueDate("2026-01-01", -1)).toThrow();
    expect(() => addCalendarDays("2026-01-01", 1.5)).toThrow();
  });

  it("calculates calendar-day and business-day terms explicitly", () => {
    expect(calculateDueDate("2026-05-13", 3, "calendar")).toBe("2026-05-16");
    // Ascension Day (14 May) and the weekend are skipped.
    expect(calculateDueDate("2026-05-13", 2, "business")).toBe("2026-05-18");
  });

  it("calculates Dutch public holidays and configurable Liberation Day", () => {
    const holidays = getNetherlandsPublicHolidays(2026);
    expect(holidays).toContain("2026-04-06"); // Easter Monday
    expect(holidays).toContain("2026-05-14"); // Ascension Day
    expect(holidays).not.toContain("2026-05-05"); // default: not universally a day off
    expect(getNetherlandsPublicHolidays(2026, { liberationDayRule: "always" })).toContain("2026-05-05");
    expect(getNetherlandsPublicHolidays(2030, { liberationDayRule: "quinquennial" })).toContain("2030-05-05");
    expect(getNetherlandsPublicHolidays(2026, { includeGoodFriday: true })).toContain("2026-04-03");
  });

  it("treats weekends, configured holidays and additional holidays as non-working days", () => {
    expect(isNetherlandsBusinessDay("2026-05-16")).toBe(false); // Saturday
    expect(isNetherlandsBusinessDay("2026-05-14")).toBe(false); // Ascension Day
    expect(isNetherlandsBusinessDay("2026-05-05", { liberationDayRule: "always" })).toBe(false);
    expect(isNetherlandsBusinessDay("2026-05-06", { additionalHolidays: ["2026-05-06"] })).toBe(false);
    expect(isNetherlandsBusinessDay("2026-05-15")).toBe(true);
  });

  it("adds and subtracts business days across a public holiday and weekend", () => {
    expect(addBusinessDays("2026-05-13", 1)).toBe("2026-05-15");
    expect(subtractBusinessDays("2026-05-18", 1)).toBe("2026-05-15");
    expect(calculateLatestRecommendedPaymentDate("2026-05-18", 1, "business")).toBe("2026-05-15");
    expect(calculateLatestRecommendedPaymentDate("2026-05-18")).toBe("2026-05-18");
  });

  it("returns exact discount savings and compares the discount with financing cost", () => {
    const worthwhile = evaluateEarlyPaymentDiscount({
      grossAmount: "100.00",
      discountPercent: "2",
      discountDeadline: "2026-01-08",
      normalDueDate: "2026-01-31",
      annualFinancingRatePercent: "20",
    });
    expect(worthwhile).toEqual({
      savingsAmount: "2.00",
      daysPaidEarly: 23,
      worthwhile: true,
      rationale: "discount-exceeds-financing-cost",
    });

    const notWorthwhile = evaluateEarlyPaymentDiscount({
      grossAmount: "100.00",
      discountPercent: "2",
      discountDeadline: "2026-01-08",
      normalDueDate: "2026-01-31",
      annualFinancingRatePercent: "40",
    });
    expect(notWorthwhile.worthwhile).toBe(false);
    expect(notWorthwhile.rationale).toBe("discount-does-not-exceed-financing-cost");
  });

  it("rounds discount savings half-up using integer cents and validates decimal strings", () => {
    expect(evaluateEarlyPaymentDiscount({
      grossAmount: "19.99",
      discountPercent: "2",
      discountDeadline: "2026-01-03",
      normalDueDate: "2026-01-03",
      annualFinancingRatePercent: "100",
    }).savingsAmount).toBe("0.40");
    expect(evaluateEarlyPaymentDiscount({
      grossAmount: "100.00",
      discountPercent: "0",
      discountDeadline: "2026-01-03",
      normalDueDate: "2026-01-03",
      annualFinancingRatePercent: "0",
    }).worthwhile).toBe(false);
    expect(() => evaluateEarlyPaymentDiscount({
      grossAmount: "19.999",
      discountPercent: "2",
      discountDeadline: "2026-01-03",
      normalDueDate: "2026-01-03",
      annualFinancingRatePercent: "10",
    })).toThrow();
    expect(() => evaluateEarlyPaymentDiscount({
      grossAmount: "19.99",
      discountPercent: "101",
      discountDeadline: "2026-01-03",
      normalDueDate: "2026-01-03",
      annualFinancingRatePercent: "10",
    })).toThrow();
    expect(() => evaluateEarlyPaymentDiscount({
      grossAmount: "19.99",
      discountPercent: "-2",
      discountDeadline: "2026-01-03",
      normalDueDate: "2026-01-03",
      annualFinancingRatePercent: "10",
    })).toThrow();
  });

  it("calculates DSO and DPO from explicitly defined period inputs without floats", () => {
    expect(calculateDso({ averageReceivables: "1500.00", netCreditSales: "9000.00", periodDays: 30 })).toBe("5.00");
    expect(calculateDpo({ averagePayables: "3000.00", creditPurchases: "12000.00", periodDays: 30 })).toBe("7.50");
    expect(() => calculateDso({ averageReceivables: "100.00", netCreditSales: "0.00", periodDays: 30 })).toThrow();
    expect(() => calculateDpo({ averagePayables: "100.00", creditPurchases: "50.00", periodDays: 0 })).toThrow();
  });
});
