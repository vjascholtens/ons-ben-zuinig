import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fileTypeFromBuffer } from "file-type";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDirectory = path.join(root, "fixtures", "synthetic");

describe("synthetic receipt fixture generator", () => {
  it("generates 10+ PDF/JPEG pairs and the exact over-limit upload file", async () => {
    const manifest = JSON.parse(await readFile(path.join(outputDirectory, "receipts.json"), "utf8"));
    const fixtures = manifest.fixtures as Array<{
      id: string;
      regels: Array<{ btw_code: string }>;
      verwacht_netto: string;
      verwacht_btw: string;
      verwacht_totaal: string;
    }>;
    execFileSync(process.execPath, [path.join(root, "scripts", "generate-fixtures.mjs")], { cwd: root });

    expect(fixtures.length).toBeGreaterThanOrEqual(10);
    expect(new Set(fixtures.map((fixture) => fixture.id)).size).toBe(fixtures.length);

    for (const fixture of fixtures) {
      const pdf = await readFile(path.join(outputDirectory, `${fixture.id}.pdf`));
      const jpeg = await readFile(path.join(outputDirectory, `${fixture.id}.jpg`));
      expect((await fileTypeFromBuffer(pdf))?.mime).toBe("application/pdf");
      expect((await fileTypeFromBuffer(jpeg))?.mime).toBe("image/jpeg");
      const metadata = {
        id: fixture.id,
        vatCodes: [...new Set(fixture.regels.map((line) => line.btw_code))],
        netAmount: fixture.verwacht_netto,
        vatAmount: fixture.verwacht_btw,
        grossAmount: fixture.verwacht_totaal
      };
      expect(jpeg.includes(Buffer.from(`OBZ_SYNTHETIC_FIXTURE:${JSON.stringify(metadata)}`))).toBe(true);
    }

    const oversized = await readFile(path.join(outputDirectory, manifest.te_groot_bestand.bestandsnaam));
    expect(oversized.byteLength).toBe(Number(manifest.te_groot_bestand.bytes));
    expect((await fileTypeFromBuffer(oversized))?.mime).toBe("application/pdf");
    expect(Number(manifest.te_groot_bestand.bytes)).toBe(Number(manifest.maximale_upload_bytes) + 1);
  });
});
