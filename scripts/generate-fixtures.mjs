import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "fixtures", "synthetic");
const manifest = JSON.parse(await readFile(path.join(outputDir, "receipts.json"), "utf8"));

const JPEG_TEMPLATE_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAEMuMjoyKkM6NjpLR0NPZKZsZFxcZMySmnmm8dT++u3U6eX//////////+Xp////////////////////////////wAALCABQACgBAREA/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAzEAACAAMECAMHBQAAAAAAAAABAgADERITIVExMkFCYXKT0SKhsiRTY3GBkZIEFCNS8P/aAAgBAQAAPwDplyw4LMz1tNvkbTxirlc36jd4Llc36jd4Llc36jd4mZLCAMrPW0u+TtHGKkah529RjOUELGWArAqQzA4nmGfnp0RDqzqjVtPboNlSoNPuRX60jb9OwaVaXEFmI+5hz9Qc6+oQSNQ87eoxg6S0WaQiCkxRiKCnh8oo3VhSBJpU+GvgJ+dNP0z+cUyK9wXlipNCGFTqnCLn6g519QhS1DyyDXXbQSNpyh3K5v1G7wXK5v1G7wXK5v1G7xMxAiYFsXXSxO8M4ctQ8sg1120Ejacodyub9Ru8Fyub9Ru8Fyub9Ru8TMQImBbF10sTvDOBbu6N7Ys221qUrUwvZPgeUHsnwPKD2T4HlAbmx/DY11rYp/YRUtgksk1120Anacod8uT9Nu0F8uT9Nu0F8uT9Nu0TMcOmAbB10qRvDOHLdUlkuwUW2xJptMO/k+9T8hBfyfep+Qgv5PvU/IRMyYjp4HVqOtaGu8IqRqHnb1GCXOWY1ArCoqCRpEL9wgYghgBUWqYGmn/cIqXNEyosspFDRhnCn6g519QiZcwICrK9bTbhO08IzlMyFbQJCLZFEbEVGOjIaPOJYFqoahKsQbtq414bKmNJUw2meYDUgCio2z6cYqZMDgKqvW0u4RtHCP/Z";

function escapePdf(value) {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "?").replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createPdf(fixture) {
  const lineRows = fixture.regels.map((line, index) =>
    `${index + 1}. ${line.omschrijving} | qty ${line.aantal} | unit EUR ${line.eenheidsprijs} | VAT code ${line.btw_code} | rate ${line.tarief}%`
  );
  const vatCodes = [...new Set(fixture.regels.map((line) => line.btw_code))].join(", ");
  const lines = [
    "SYNTHETIC RECEIPT - TEST DATA ONLY - NOT A TAX DOCUMENT",
    `Fixture: ${fixture.id}`,
    `Supplier: ${fixture.leverancier}`,
    `Date: ${fixture.datum}`,
    `Invoice: ${fixture.factuurnummer}`,
    `VAT codes: ${vatCodes}`,
    "Items:",
    ...lineRows,
    `Net total EUR: ${fixture.verwacht_netto}`,
    `VAT total EUR: ${fixture.verwacht_btw}`,
    `Gross total EUR: ${fixture.verwacht_totaal}`,
    "SYNTHETIC TEST ONLY - NO REAL TRANSACTION"
  ];
  const stream = [
    "BT",
    "/F1 10 Tf",
    "46 760 Td",
    "14 TL",
    ...lines.map((line) => `(${escapePdf(line)}) Tj T*`),
    "ET"
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}

function createJpeg(fixture) {
  const template = Buffer.from(JPEG_TEMPLATE_BASE64, "base64");
  const metadata = {
    id: fixture.id,
    vatCodes: [...new Set(fixture.regels.map((line) => line.btw_code))],
    netAmount: fixture.verwacht_netto,
    vatAmount: fixture.verwacht_btw,
    grossAmount: fixture.verwacht_totaal
  };
  const details = Buffer.from(`OBZ_SYNTHETIC_FIXTURE:${JSON.stringify(metadata)}`, "utf8");
  const marker = Buffer.alloc(4);
  marker[0] = 0xff;
  marker[1] = 0xfe; // JPEG COM marker; it does not change the displayed image.
  marker.writeUInt16BE(details.length + 2, 2);
  return Buffer.concat([template.subarray(0, 2), marker, details, template.subarray(2)]);
}

await mkdir(outputDir, { recursive: true });
const fixtures = manifest.fixtures;
if (!Array.isArray(fixtures) || fixtures.length < 10) {
  throw new Error("Het synthetische manifest moet minstens 10 bonnetjes bevatten.");
}
for (const fixture of fixtures) {
  if (!/^[a-z0-9-]+$/.test(fixture.id) || !Array.isArray(fixture.regels) || fixture.regels.length === 0) {
    throw new Error("Elke fixture moet een ID en minstens één regel hebben.");
  }
  for (const amount of [fixture.verwacht_netto, fixture.verwacht_btw, fixture.verwacht_totaal]) {
    if (typeof amount !== "string" || !/^\d+\.\d{2}$/.test(amount)) {
      throw new Error(`Fixture ${fixture.id}: totaalbedragen moeten decimale strings met twee decimalen zijn.`);
    }
  }
  await writeFile(path.join(outputDir, `${fixture.id}.pdf`), createPdf(fixture));
  await writeFile(path.join(outputDir, `${fixture.id}.jpg`), createJpeg(fixture));
}

if (!process.argv.includes("--skip-oversized")) {
  const sample = createPdf(fixtures[0]);
  const eofIndex = sample.lastIndexOf(Buffer.from("%%EOF"));
  const prefix = sample.subarray(0, eofIndex);
  const suffix = Buffer.from("%%EOF\n", "ascii");
  const targetBytes = Number(manifest.te_groot_bestand.bytes);
  const maxUploadBytes = Number(manifest.maximale_upload_bytes);
  if (targetBytes !== maxUploadBytes + 1) throw new Error("Het limietbestand moet exact één byte groter zijn dan de uploadlimiet.");
  const paddingLength = targetBytes - prefix.length - suffix.length;
  if (paddingLength < 0) throw new Error("De limiettest moet groter zijn dan de PDF-template.");
  const oversized = Buffer.concat([prefix, Buffer.alloc(paddingLength, 0x20), suffix]);
  if (oversized.byteLength !== targetBytes) throw new Error("Het gegenereerde limietbestand heeft een onjuiste grootte.");
  await writeFile(path.join(outputDir, manifest.te_groot_bestand.bestandsnaam), oversized);
}

console.log(`Generated ${fixtures.length} synthetische PDF/JPEG-paren in fixtures/synthetic/.`);
if (!process.argv.includes("--skip-oversized")) {
  console.log(`Generated ${manifest.te_groot_bestand.bestandsnaam} (${manifest.te_groot_bestand.bytes} bytes).`);
}
