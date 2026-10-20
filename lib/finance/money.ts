function parseUnsignedDecimal(value: string, scale: number): bigint {
  if (!/^\\d+(?:\\.\\d+)?$/.test(value)) {
    throw new Error("Gebruik een niet-negatieve decimale string.");
  }
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > scale) {
    throw new Error(`Maximaal ${scale} decimalen toegestaan.`);
  }
  return BigInt(whole) * 10n ** BigInt(scale) + BigInt(fraction.padEnd(scale, "0") || "0");
}

function formatCents(cents: bigint): string {
  const whole = cents / 100n;
  const fraction = (cents % 100n).toString().padStart(2, "0");
  return `${whole.toString()}.${fraction}`;
}

/** Half-up cent rounding for an already-calculated non-negative decimal amount. */
export function roundToCents(value: string): string {
  if (!/^\\d+(?:\\.\\d+)?$/.test(value)) {
    throw new Error("Gebruik een niet-negatieve decimale string.");
  }
  const [whole, fraction = ""] = value.split(".");
  const centsText = fraction.padEnd(2, "0").slice(0, 2);
  let cents = BigInt(whole) * 100n + BigInt(centsText || "0");
  if ((fraction[2] ?? "0") >= "5") cents += 1n;
  return formatCents(cents);
}

/**
 * Calculate and round VAT for one already-rounded line base without binary floating point.
 * Both arguments are decimal strings; e.g. calculateLineVat("0.50", "21.00") => "0.11".
 */
export function calculateLineVat(netAmount: string, vatRate: string): string {
  const netCents = parseUnsignedDecimal(netAmount, 2);
  const rateHundredths = parseUnsignedDecimal(vatRate, 2);
  if (rateHundredths > 10000n) throw new Error("Het btw-percentage moet maximaal 100% zijn.");
  const vatCents = (netCents * rateHundredths + 5000n) / 10000n;
  return formatCents(vatCents);
}
