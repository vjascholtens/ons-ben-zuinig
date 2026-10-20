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
    execFileSync(process.execPath, [path.join(root, "scripts", "generate-fixtures.mjs")], { cwd: root });

    expect(manifest.scenarios.length).toBeGreaterThanOrEqual(10);
    expect(new Set(manifest.scenarios.map((fixture: { id: string }) => fixture.id)).size).toBe(manifest.scenarios.length);

    for (const fixture of manifest.scenarios) {
      const pdf = await readFile(path.join(outputDirectory, `${fixture.id}.pdf`));
      const jpeg = await readFile(path.join(outputDirectory, `${fixture.id}.jpg`));
      expect((await fileTypeFromBuffer(pdf))?.mime).toBe("application/pdf");
      expect((await fileTypeFromBuffer(jpeg))?.mime).toBe("image/jpeg");
      expect(jpeg.includes(Buffer.from(`OBZ_SYNTHETIC_FIXTURE:${JSON.stringify({
        id: fixture.id,
        vatTreatment: fixture.vatTreatment,
        vatRate: fixture.vatRate,
        netAmount: fixture.netAmount,
        vatAmount: fixture.vatAmount,
        grossAmount: fixture.grossAmount
      })}`))).toBe(true);
    }

    const oversized = await readFile(path.join(outputDirectory, manifest.oversizedFixture.filename));
    expect(oversized.byteLength).toBe(manifest.oversizedFixture.minimumBytes);
    expect((await fileTypeFromBuffer(oversized))?.mime).toBe("application/pdf");
    expect(manifest.oversizedFixture.minimumBytes).toBe(manifest.maximumUploadBytes + 1);
    expect(manifest.roundingCases.map((item: { expectedRounded: string }) => item.expectedRounded)).toEqual(["0.01", "0.00", "1.01"]);
  });
});
