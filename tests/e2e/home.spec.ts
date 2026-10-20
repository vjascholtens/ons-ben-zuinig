import { expect, test } from "@playwright/test";

test("renders the app shell and explains the upload is only a demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Je administratie, weer helemaal bij." })).toBeVisible();
  await expect(page.getByLabel("Kies een bonnetje")).toBeVisible();
  await expect(page.getByText(/Er wordt nog niets geüpload of opgeslagen/i)).toBeVisible();
});
