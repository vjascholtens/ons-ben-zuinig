import { readFileSync } from "node:fs";
import { createServerClient } from "@supabase/ssr";
import { expect, test, type Page } from "@playwright/test";

try {
  const envText = readFileSync(".env.local", "utf8");
  for (const line of envText.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const name = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[name] === undefined) process.env[name] = value;
  }
} catch {
  // The authenticated browser suite reports missing local test configuration clearly.
}

const baseUrl = "http://127.0.0.1:3000";
const fixtureId = "btw-21-een-regel";
const syntheticPdf = Buffer.from("%PDF-1.4\n% synthetic test receipt only\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n", "ascii");

async function loginAsTestUser(page: Page) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const email = process.env.OBZ_TEST_USER_A_EMAIL;
  const password = process.env.OBZ_TEST_USER_A_PASSWORD;
  if (!url || !key || !email || !password) {
    throw new Error("Vul de Supabase URL/publishable key en OBZ_TEST_USER_A_EMAIL/PASSWORD in .env.local; deel deze waarden nooit in chat.");
  }

  const cookieMap = new Map<string, { name: string; value: string; options?: { maxAge?: number; path?: string; httpOnly?: boolean } }>();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => [...cookieMap.values()].map(({ name, value }) => ({ name, value })),
      setAll: (cookies) => {
        for (const cookie of cookies) {
          if (cookie.options?.maxAge === 0 || cookie.value === "") cookieMap.delete(cookie.name);
          else cookieMap.set(cookie.name, cookie);
        }
      },
    },
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || cookieMap.size === 0) {
    throw new Error("Testgebruiker A kon niet inloggen. Controleer het bestaande, bevestigde testaccount en wachtwoord.");
  }

  await page.context().addCookies([...cookieMap.values()].map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    url: baseUrl,
    path: typeof cookie.options?.path === "string" ? cookie.options.path : "/",
    httpOnly: cookie.options?.httpOnly === true,
    secure: false,
    sameSite: "Lax" as const,
  })));
}

async function uploadAndOpenProposal(page: Page, filename: string) {
  await page.goto("/");
  await page.getByLabel("Synthetisch mock-OCR-profiel").selectOption(fixtureId);
  await page.locator("#receipt-file").setInputFiles({
    name: filename,
    mimeType: "application/pdf",
    buffer: syntheticPdf,
  });
  await expect(page).toHaveURL(/\/receipts\?review=[0-9a-f-]+/i);
  await expect(page.getByRole("heading", { name: "Mock-OCR-voorstel" })).toBeVisible();
}


test("vrijdag-demo: upload → mock-OCR-voorstel → menselijke controle → bevestigen", async ({ page }) => {
  await loginAsTestUser(page);
  await uploadAndOpenProposal(page, "synthetic-demo-confirm.pdf");
  await expect(page.getByLabel("Leverancier")).toHaveValue("Synthetische Voorbeeldwinkel Noord");
  await expect(page.getByText("Voorstel — nog niet gecontroleerd")).toBeVisible();

  await page.getByLabel("Leverancier").fill("Gecorrigeerde synthetische leverancier");
  await page.getByLabel("Btw-behandeling").selectOption("standard");
  await page.getByRole("button", { name: "Corrigeren en bevestigen" }).click();

  await expect(page.getByText("Gecontroleerde documentgegevens opgeslagen.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Afzonderlijk opgeslagen bevestigde gegevens" })).toBeVisible();
  await expect(page.getByText("Gecorrigeerde synthetische leverancier")).toBeVisible();
  await expect(page.getByText(/Status: bevestigd/i)).toBeVisible();
});
