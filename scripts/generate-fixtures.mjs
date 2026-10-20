import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "fixtures", "synthetic");
const manifest = JSON.parse(await readFile(path.join(outputDir, "receipts.json"), "utf8"));

const JPEG_TEMPLATE_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAFA3PEY8MlBGQUZaVVBfeMiCeG5uePWvuZHI////////////////////////////////////////////////////wAALCACAAEABAREA/8QAGAABAQEBAQAAAAAAAAAAAAAAAAIBAwT/xAAuEAABAgMFBwQDAQEAAAAAAAABAAIDERIhU5HB0RMxMlFhcpIiQVJxI4GhsWL/2gAIAQEAAD8A9ADnPf8AkcADIAAch0VUOvX4DRKHXr8BolDr1+A0Sh16/AaJQ69fgNEodevwGikhzXs/I4gmRBA5Hoqh8cTuyCOeQ+lrZ2T3yw5/z2QxJOplbMAdQff+HDqphxjEa2TZEgmRO6Uv9nNGxHGVTQJuLbDPdPp0VtdUXCXCZfwHNUoiccPuyKQ+OJ3ZBZFh7QSJFJ3gieHI4qi2bw6e4EYy0UQ4NDgarA2Upe9lv8C0wgQA6RAcXSI3znqtYwMqpkATOQG6wK1ETjh92RSHxxO7IKYrZvh2uEzIycR7FSyZDyS5pBd6i6wWn2n7fSpgnUwh4sBM3TwM5+3T6WwB+FhmSSATMzXRFETjh92RSHxxO7IKpAymNywQ2B1QY0O5ytWta1ok1oA6BAABICQC1FETjh92RSHxxO7IJsYV2zxCbGFds8QmxhXbPEJsYV2zxCbGFds8QmxhXbPEJsYV2zxCbGFds8QmxhXbPELHgB0IASAdkVsPjid2QSh16/AaJQ69fgNEodevwGiUOvX4DRKHXr8BolDr1+A0WPsdCtn6t/6K2HxxO7IJW66fiNUrddPxGqVuun4jVK3XT8Rqlbrp+I1St10/EarH2uhWS9W79FbD44ndkFaIiIoiccPuyKQ+OJ3ZBNjCu2eITYwrtniE2MK7Z4hNjCu2eITYwrtniE2MK7Z4hY8AOhACQDsith8cTuyCSi/NnidUlF+bPE6pKL82eJ1SUX5s8TqkovzZ4nVJRfmzxOqx86oU99WRWw+OJ3ZBNq3k/wOibVvJ/gdE2reT/A6JtW8n+B0Tat5P8AA6JtW8n+B0WPM3Qj/wBZFbD44ndkFaIiIoiccPuyKQ+OJ3ZBKHXr8BolDr1+A0Sh16/AaJQ69fgNEodevwGiUOvX4DRY+x0K2fq3/orYfHE7sgpc47amtzRISpbPn0KB7jRbve4H6E9FMCIXFoLi4lszMSl9WCzfzWtc+sEu9LnFtMt0p6f1dkUROOH3ZFSC5r3/AI3EEzBBHIdVjhU6owok5SscB/jlosdVsXz+xLCckBpplBf6RIWjdj0WAAPrEB1X2NVdbrp+I1St10/EaqSXOez8bgAZkkjkeq//2Q==";

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
