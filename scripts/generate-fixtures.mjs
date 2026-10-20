import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateTotals, roundDecimalToCents } from "./fixture-math.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "fixtures", "synthetic");
const manifest = JSON.parse(await readFile(path.join(outputDir, "receipts.json"), "utf8"));

const JPEG_TEMPLATE_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAEMuMjoyKkM6NjpLR0NPZKZsZFxcZMySmnmm8dT++u3U6eX//////////+Xp////////////////////////////wAALCABQACgBAREA/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAzEAACAAMECAMHBQAAAAAAAAABAgADERITIVExMkFCYXKT0SKhsiRTY3GBkZIEFCNS8P/aAAgBAQAAPwDplyw4LMz1tNvkbTxirlc36jd4Llc36jd4Llc36jd4mZLCAMrPW0u+TtHGKkah529RjOUELGWArAqQzA4nmGfnp0RDqzqjVtPboNlSoNPuRX60jb9OwaVaXEFmI+5hz9Qc6+oQSNQ87eoxg6S0WaQiCkxRiKCnh8oo3VhSBJpU+GvgJ+dNP0z+cUyK9wXlipNCGFTqnCLn6g519QhS1DyyDXXbQSNpyh3K5v1G7wXK5v1G7wXK5v1G7xMxAiYFsXXSxO8M4ctQ8sg1120Ejacodyub9Ru8Fyub9Ru8Fyub9Ru8TMQImBbF10sTvDOBbu6N7Ys221qUrUwvZPgeUHsnwPKD2T4HlAbmx/DY11rYp/YRUtgksk1120Anacod8uT9Nu0F8uT9Nu0F8uT9Nu0TMcOmAbB10qRvDOHLdUlkuwUW2xJptMO/k+9T8hBfyfep+Qgv5PvU/IRMyYjp4HVqOtaGu8IqRqHnb1GCXOWY1ArCoqCRpEL9wgYghgBUWqYGmn/cIqXNEyosspFDRhnCn6g519QiZcwICrK9bTbhO08IzlMyFbQJCLZFEbEVGOjIaPOJYFqoahKsQbtq414bKmNJUw2meYDUgCio2z6cYqZMDgKqvW0u4RtHCP/Z";

function escapePdf(value) {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "?").replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createPdf(fixture) {
  const lineRows = fixture.regels.map((line, index) =>
    `${index + 1}. ${line.omschrijving} | ${line.aantal} x EUR ${line.eenheidsprijs} | ${line.btw_code} ${line.tarief}%`
  );
  const lines = [
    "SYNTHETIC RECEIPT - TEST DATA ONLY - NOT A TAX DOCUMENT",
    `Fixture: ${fixture.id}`,
    `Supplier: ${fixture.leverancier}`,
    `Date: ${fixture.datum}`,
    `Invoice: ${fixture.factuurnummer}`,
    "Items:",
    ...lineRows,
    `Net total EUR: ${fixture.verwacht_netto}`,
    `VAT total EUR: ${fixture.verwacht_btw}`,
    `Gross total EUR: ${fixture.verwacht_totaal}`,
    "SYNTHETIC TEST ONLY - NO REAL TRANSACTION"
  ];
  const stream = ["BT", "/F1 10 Tf", "46 760 Td", "14 TL", ...lines.map((line) => `(${escapePdf(line)}) Tj T*`), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(output, "ascii"));
    output += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(output, "ascii");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(output, "ascii");
}

function createJpeg(fixture) {
  let template = Buffer.from(JPEG_TEMPLATE_BASE64, "base64");
  if (template.length < 4 || template[0] !== 0xff || template[1] !== 0xd8) {
    throw new Error("The embedded synthetic JPEG template is invalid.");
  }
  if (template[template.length - 2] !== 0xff || template[template.length - 1] !== 0xd9) {
    template = Buffer.concat([template, Buffer.from([0xff, 0xd9])]);
  }
  const details = Buffer.from(`OBZ_SYNTHETIC_FIXTURE:${JSON.stringify({
    id: fixture.id,
    leverancier: fixture.leverancier,
    datum: fixture.datum,
    factuurnummer: fixture.factuurnummer,
    regels: fixture.regels,
    verwacht_netto: fixture.verwacht_netto,
    verwacht_btw: fixture.verwacht_btw,
    verwacht_totaal: fixture.verwacht_totaal
  })}`, "utf8");
  if (details.length + 2 > 65535) throw new Error("Synthetic JPEG metadata is too large.");
  const marker = Buffer.alloc(4);
  marker[0] = 0xff;
  marker[1] = 0xfe;
  marker.writeUInt16BE(details.length + 2, 2);
  return Buffer.concat([template.subarray(0, 2), marker, details, template.subarray(2)]);
}

await mkdir(outputDir, { recursive: true });
if (!Array.isArray(manifest.fixtures) || manifest.fixtures.length < 10) {
  throw new Error("The synthetic manifest must contain at least 10 receipt fixtures.");
}
const ids = new Set();
for (const fixture of manifest.fixtures) {
  if (!fixture.id || ids.has(fixture.id)) throw new Error(`Fixture id is missing or duplicated: ${fixture.id}`);
  ids.add(fixture.id);
  const calculated = calculateTotals(fixture);
  if (calculated.netto !== fixture.verwacht_netto || calculated.btw !== fixture.verwacht_btw || calculated.totaal !== fixture.verwacht_totaal) {
    throw new Error(`Fixture totals do not match manifest values: ${fixture.id}`);
  }
  await writeFile(path.join(outputDir, `${fixture.id}.pdf`), createPdf(fixture));
  await writeFile(path.join(outputDir, `${fixture.id}.jpg`), createJpeg(fixture));
}
for (const rounding of manifest.afrondingsgevallen) {
  if (roundDecimalToCents(rounding.bedrag) !== rounding.verwacht) {
    throw new Error(`Rounding case does not match manifest: ${rounding.id}`);
  }
}

if (!process.argv.includes("--skip-oversized")) {
  const sample = createPdf(manifest.fixtures[0]);
  const eofIndex = sample.lastIndexOf(Buffer.from("%%EOF"));
  const prefix = sample.subarray(0, eofIndex);
  const suffix = Buffer.from("%%EOF\n", "ascii");
  const targetBytes = Number(manifest.te_groot_bestand.bytes);
  const paddingLength = targetBytes - prefix.length - suffix.length;
  if (paddingLength < 0) throw new Error("Oversized test size must exceed the PDF template size.");
  const oversized = Buffer.concat([prefix, Buffer.alloc(paddingLength, 0x20), suffix]);
  if (oversized.byteLength !== targetBytes) throw new Error("Oversized fixture has an unexpected byte size.");
  await writeFile(path.join(outputDir, manifest.te_groot_bestand.bestandsnaam), oversized);
}

console.log(`Generated ${manifest.fixtures.length} synthetic PDF/JPEG pairs in fixtures/synthetic/.`);
if (!process.argv.includes("--skip-oversized")) {
  console.log(`Generated ${manifest.oversizedFixture.filename} (${manifest.oversizedFixture.minimumBytes} bytes).`);
}
