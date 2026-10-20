const DECIMAL = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function scaled(value, scale, label) {
  if (typeof value !== "string" || !DECIMAL.test(value)) throw new Error(`${label} must be a positive decimal string.`);
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > scale) throw new Error(`${label} supports at most ${scale} decimal places.`);
  return BigInt(whole) * 10n ** BigInt(scale) + BigInt(fraction.padEnd(scale, "0") || "0");
}

function roundHalfUp(numerator, denominator) {
  if (numerator < 0n || denominator <= 0n) throw new Error("Only non-negative values can be rounded.");
  return (numerator + denominator / 2n) / denominator;
}

export function formatCents(cents) {
  if (typeof cents !== "bigint" || cents < 0n) throw new Error("Cents must be a non-negative bigint.");
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
}

export function roundDecimalToCents(value) {
  const thousandths = scaled(value, 3, "value");
  return formatCents(roundHalfUp(thousandths, 10n));
}

export function calculateTotals(fixture) {
  if (!fixture || !Array.isArray(fixture.regels) || fixture.regels.length === 0) {
    throw new Error("A fixture must contain at least one line.");
  }
  let netCents = 0n;
  let vatCents = 0n;

  for (const line of fixture.regels) {
    if (!line || typeof line.omschrijving !== "string" || !line.omschrijving.trim()) {
      throw new Error("Every line needs a description.");
    }
    const quantityCents = scaled(line.aantal, 2, "aantal");
    if (quantityCents <= 0n) throw new Error("aantal must be greater than zero.");
    const unitPriceThousandths = scaled(line.eenheidsprijs, 3, "eenheidsprijs");
    const lineNetCents = roundHalfUp(quantityCents * unitPriceThousandths, 1000n);
    const rateHundredths = scaled(line.tarief, 2, "tarief");
    let lineVatCents = 0n;

    if (line.btw_code === "standaard") {
      if (rateHundredths !== 900n && rateHundredths !== 2100n) {
        throw new Error("Standard VAT must be 9.00 or 21.00.");
      }
      lineVatCents = roundHalfUp(lineNetCents * rateHundredths, 10000n);
    } else if (["nultarief", "vrijgesteld", "verlegd", "kor"].includes(line.btw_code)) {
      if (rateHundredths !== 0n) throw new Error(`${line.btw_code} lines must use calculation rate 0.00.`);
    } else {
      throw new Error(`Unsupported VAT code: ${line.btw_code}`);
    }

    netCents += lineNetCents;
    vatCents += lineVatCents;
  }

  return {
    netto: formatCents(netCents),
    btw: formatCents(vatCents),
    totaal: formatCents(netCents + vatCents)
  };
}
