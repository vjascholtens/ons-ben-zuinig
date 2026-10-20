import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "fixtures", "synthetic");
const manifest = JSON.parse(await readFile(path.join(outputDir, "receipts.json"), "utf8"));

const JPEG_TEMPLATE_BASE64 = "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";

function escapePdf(value) {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "?").replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createPdf(fixture) {
  const lineRows = fixture.lines.map((line, index) => {
    const treatment = line.vatTreatment ?? fixture.vatTreatment;
    const rate = line.vatRate == null ? treatment : `${line.vatRate}%`;
    return `${index + 1}. ${line.description} | net EUR ${line.netAmount} | VAT ${rate} | EUR ${line.vatAmount}`;
  });
  const lines = [
    "SYNTHETIC RECEIPT - TEST DATA ONLY - NOT A TAX DOCUMENT",
    `Fixture: ${fixture.id}`,
    `Supplier: ${fixture.supplier}`,
    `Date: ${fixture.documentDate}`,
    `Invoice: ${fixture.invoiceNumber}`,
    `VAT treatment: ${fixture.vatTreatment}`,
    `VAT rate: ${fixture.vatRate ?? "per line / special treatment"}`,
    `Net total EUR: ${fixture.netAmount}`,
    "Items:",
    ...lineRows,
    `VAT total EUR: ${fixture.vatAmount}`,
    `Gross total EUR: ${fixture.grossAmount}`,
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
  const details = Buffer.from(`OBZ_SYNTHETIC_FIXTURE:${JSON.stringify({
    id: fixture.id,
    vatTreatment: fixture.vatTreatment,
    vatRate: fixture.vatRate,
    netAmount: fixture.netAmount,
    vatAmount: fixture.vatAmount,
    grossAmount: fixture.grossAmount
  })}`, "utf8");
  const marker = Buffer.alloc(4);
  marker[0] = 0xff;
  marker[1] = 0xfe; // JPEG COM segment; viewers ignore it when displaying the image.
  marker.writeUInt16BE(details.length + 2, 2);
  return Buffer.concat([template.subarray(0, 2), marker, details, template.subarray(2)]);
}

await mkdir(outputDir, { recursive: true });
if (!Array.isArray(manifest.scenarios) || manifest.scenarios.length < 10) {
  throw new Error("The synthetic manifest must contain at least 10 receipt scenarios.");
}
for (const fixture of manifest.scenarios) {
  for (const amount of [fixture.netAmount, fixture.vatAmount, fixture.grossAmount]) {
    if (typeof amount !== "string" || !/^\d+\.\d{2}$/.test(amount)) {
      throw new Error(`Fixture ${fixture.id} must keep monetary values as decimal strings.`);
    }
  }
  await writeFile(path.join(outputDir, `${fixture.id}.pdf`), createPdf(fixture));
  await writeFile(path.join(outputDir, `${fixture.id}.jpg`), createJpeg(fixture));
}

if (!process.argv.includes("--skip-oversized")) {
  const sample = createPdf(manifest.scenarios[0]);
  const eofIndex = sample.lastIndexOf(Buffer.from("%%EOF"));
  const prefix = sample.subarray(0, eofIndex);
  const suffix = Buffer.from("%%EOF\n", "ascii");
  const targetBytes = manifest.oversizedFixture.minimumBytes;
  const paddingLength = targetBytes - prefix.length - suffix.length;
  if (paddingLength < 0) throw new Error("Oversized test size must exceed the PDF template size.");
  const oversized = Buffer.concat([prefix, Buffer.alloc(paddingLength, 0x20), suffix]);
  if (oversized.byteLength !== targetBytes) throw new Error("Oversized fixture has an unexpected byte size.");
  await writeFile(path.join(outputDir, manifest.oversizedFixture.filename), oversized);
}

console.log(`Generated ${manifest.scenarios.length} synthetic PDF/JPEG pairs in fixtures/synthetic/.`);
if (!process.argv.includes("--skip-oversized")) {
  console.log(`Generated ${manifest.oversizedFixture.filename} (${manifest.oversizedFixture.minimumBytes} bytes).`);
}
