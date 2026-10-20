import { expect, test } from "@playwright/test";

test("renders the app shell and explains the upload is only a demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Je administratie, weer helemaal bij." })).toBeVisible();
  await expect(page.getByLabel("Kies een bonnetje")).toBeVisible();
  await expect(page.getByText(/uploadt niets/i)).toBeVisible();
});

test("upload API stays disabled until Supabase is configured", async ({ page }) => {
  const response = await page.request.post("/api/receipts", {
    multipart: {
      file: {
        name: "synthetic-receipt.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\n%synthetic test file\n", "utf8"),
      },
    },
  });

  expect(response.status()).toBe(503);
});
