/**
 * Pure cash-optimizer calculations.
 *
 * Dates are date-only ISO strings (YYYY-MM-DD), never timestamps. Monetary
 * inputs/outputs are decimal strings. All money arithmetic uses integer cents
 * and BigInt; no JavaScript floating-point arithmetic is used for money.
 *
 * Provisional conventions pending formal approval of #14 and #2:
 * - term unit is explicit (calendar days or business days);
 * - weekends are non-working days;
 * - NL public holidays are excluded, except Good Friday by default because
 *   whether it is a non-working day depends on the applicable work agreement;
 * - Liberation Day (5 May) is configurable (never / always / every five years);
 * - discount is worthwhile when the discount rate exceeds the financing cost
 *   for the days paid early; equality is considered worthwhile.
 */

export type DateOnly = `${number}-${number}-${number}`;
export type DayUnit = "calendar" | "business";
export type LiberationDayRule = "never" | "always" | "quinquennial";

export type NetherlandsCalendarOptions = {
  includeGoodFriday?: boolean;
  liberationDayRule?: LiberationDayRule;
  additionalHolidays?: readonly string[];
};

const DAY_MS = 86_400_000;
const MONEY_SCALE = 100n;
const PERCENT_SCALE = 10_000n; // percent values with up to four decimal places

function parseDate(date: string): { year: number; month: number; day: number; utc: number } {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) throw new Error(`Invalid ISO date: ${date}`);
  const [year, month, day] = date.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const parsed = new Date(utc);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new Error(`Invalid calendar date: ${date}`);
  }
  return { year, month, day, utc };
}

function formatDate(utc: number): DateOnly {
  const date = new Date(utc);
  return `${date.getUTCFullYear().toString().padStart(4, "0")}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

export function addCalendarDays(date: string, days: number): DateOnly {
  const parsed = parseDate(date);
  if (!Number.isSafeInteger(days)) throw new Error("Day count must be a safe integer.");
  return formatDate(parsed.utc + days * DAY_MS);
}

function assertDayCount(days: number): void {
  if (!Number.isSafeInteger(days) || days < 0) throw new Error("Day count must be a non-negative safe integer.");
}

function easterSunday(year: number): DateOnly {
  // Gregorian computus (Meeus/Jones/Butcher), using integer arithmetic.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export function getNetherlandsPublicHolidays(year: number, options: NetherlandsCalendarOptions = {}): readonly DateOnly[] {
  if (!Number.isInteger(year) || year < 1900 || year > 9999) throw new Error("Year must be an integer between 1900 and 9999.");
  const easter = easterSunday(year);
  const holidays = new Set<DateOnly>([
    `${year}-01-01`,
    addCalendarDays(easter, 1), // Easter Monday
    addCalendarDays(easter, 39), // Ascension Day
    addCalendarDays(easter, 49), // Whit Sunday
    addCalendarDays(easter, 50), // Whit Monday
    `${year}-12-25`,
    `${year}-12-26`,
  ]);

  // King's Day is normally 27 April; if that is a Sunday it moves to 26 April.
  const kingsDay = `${year}-04-27`;
  holidays.add(new Date(parseDate(kingsDay).utc).getUTCDay() === 0 ? `${year}-04-26` : kingsDay);

  // Good Friday is Easter Sunday minus two days.
  if (options.includeGoodFriday === true) {
    const easterDate = parseDate(easter);
    holidays.add(formatDate(easterDate.utc - 2 * DAY_MS));
  }

  const liberationRule = options.liberationDayRule ?? "never";
  if (liberationRule === "always" || (liberationRule === "quinquennial" && year % 5 === 0)) {
    holidays.add(`${year}-05-05`);
  }
  for (const extra of options.additionalHolidays ?? []) {
    parseDate(extra);
    if (extra.startsWith(`${year}-`)) holidays.add(extra as DateOnly);
  }
  return [...holidays].sort();
}

export function isNetherlandsBusinessDay(date: string, options: NetherlandsCalendarOptions = {}): boolean {
  const parsed = parseDate(date);
  const weekday = new Date(parsed.utc).getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !getNetherlandsPublicHolidays(parsed.year, options).includes(date as DateOnly);
}

export function addBusinessDays(date: string, days: number, options: NetherlandsCalendarOptions = {}): DateOnly {
  parseDate(date);
  assertDayCount(days);
  let current = date as DateOnly;
  let remaining = days;
  while (remaining > 0) {
    current = addCalendarDays(current, 1);
    if (isNetherlandsBusinessDay(current, options)) remaining -= 1;
  }
  return current;
}

export function subtractBusinessDays(date: string, days: number, options: NetherlandsCalendarOptions = {}): DateOnly {
  parseDate(date);
  assertDayCount(days);
  let current = date as DateOnly;
  let remaining = days;
  while (remaining > 0) {
    current = addCalendarDays(current, -1);
    if (isNetherlandsBusinessDay(current, options)) remaining -= 1;
  }
  return current;
}

export function calculateDueDate(
  invoiceDate: string,
  termDays: number,
  unit: DayUnit = "calendar",
  calendar: NetherlandsCalendarOptions = {},
): DateOnly {
  parseDate(invoiceDate);
  assertDayCount(termDays);
  if (unit === "calendar") return addCalendarDays(invoiceDate, termDays);
  if (unit === "business") return addBusinessDays(invoiceDate, termDays, calendar);
  throw new Error("Unknown day unit.");
}

export function calculateLatestRecommendedPaymentDate(
  dueDate: string,
  safetyMarginDays = 0,
  unit: DayUnit = "calendar",
  calendar: NetherlandsCalendarOptions = {},
): DateOnly {
  parseDate(dueDate);
  assertDayCount(safetyMarginDays);
  if (unit === "calendar") return addCalendarDays(dueDate, -safetyMarginDays);
  if (unit === "business") return subtractBusinessDays(dueDate, safetyMarginDays, calendar);
  throw new Error("Unknown day unit.");
}

function parseScaledDecimal(value: string, scale: bigint, maxDecimals: number, field: string): bigint {
  const pattern = new RegExp(`^(0|[1-9]\\d*)(?:\\.(\\d{1,${maxDecimals}}))?$`, "u");
  const match = pattern.exec(value);
  if (!match) throw new Error(`${field} must be a non-negative decimal string with at most ${maxDecimals} decimal places.`);
  const decimals = (match[2] ?? "").padEnd(maxDecimals, "0");
  return BigInt(match[1]) * scale + BigInt(decimals || "0");
}

function formatScaled(value: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals);
  const whole = value / scale;
  const fraction = (value % scale).toString().padStart(decimals, "0");
  return decimals === 0 ? whole.toString() : `${whole}.${fraction}`;
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error("Denominator must be positive.");
  return (numerator + denominator / 2n) / denominator;
}

export function evaluateEarlyPaymentDiscount(input: {
  grossAmount: string;
  discountPercent: string;
  discountDeadline: string;
  normalDueDate: string;
  annualFinancingRatePercent: string;
}): {
  savingsAmount: string;
  daysPaidEarly: number;
  worthwhile: boolean;
  rationale: "discount-exceeds-financing-cost" | "discount-does-not-exceed-financing-cost";
} {
  const amountCents = parseScaledDecimal(input.grossAmount, MONEY_SCALE, 2, "grossAmount");
  const discountRate = parseScaledDecimal(input.discountPercent, PERCENT_SCALE, 4, "discountPercent");
  const financingRate = parseScaledDecimal(input.annualFinancingRatePercent, PERCENT_SCALE, 4, "annualFinancingRatePercent");
  const deadline = parseDate(input.discountDeadline);
  const dueDate = parseDate(input.normalDueDate);
  const daysPaidEarly = Math.max(0, Math.round((dueDate.utc - deadline.utc) / DAY_MS));
  const savingsCents = roundHalfUp(amountCents * discountRate, PERCENT_SCALE * 100n);
  const worthwhile = discountRate * 365n >= financingRate * BigInt(daysPaidEarly);
  return {
    savingsAmount: formatScaled(savingsCents, 2),
    daysPaidEarly,
    worthwhile,
    rationale: worthwhile ? "discount-exceeds-financing-cost" : "discount-does-not-exceed-financing-cost",
  };
}

function ratioInDays(numeratorAmount: string, denominatorAmount: string, periodDays: number, field: string): string {
  const numerator = parseScaledDecimal(numeratorAmount, MONEY_SCALE, 2, `${field} numerator`);
  const denominator = parseScaledDecimal(denominatorAmount, MONEY_SCALE, 2, `${field} denominator`);
  if (denominator === 0n) throw new Error(`${field} denominator must be greater than zero.`);
  if (!Number.isSafeInteger(periodDays) || periodDays <= 0) throw new Error("Period days must be a positive safe integer.");
  return formatScaled(roundHalfUp(numerator * BigInt(periodDays) * 100n, denominator), 2);
}

/** DSO = average receivables / net credit sales in period × period days. */
export function calculateDso(input: { averageReceivables: string; netCreditSales: string; periodDays: number }): string {
  return ratioInDays(input.averageReceivables, input.netCreditSales, input.periodDays, "DSO");
}

/** DPO = average payables / cost of goods/services bought on credit × period days. */
export function calculateDpo(input: { averagePayables: string; creditPurchases: string; periodDays: number }): string {
  return ratioInDays(input.averagePayables, input.creditPurchases, input.periodDays, "DPO");
}
