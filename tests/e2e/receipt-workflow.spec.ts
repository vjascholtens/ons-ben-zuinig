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

test("login + synthetische upload opent een deterministisch mock-OCR-voorstel", async ({ page }) => {
  await loginAsTestUser(page);
  await uploadAndOpenProposal(page, "synthetic-login-upload.pdf");
  await expect(page.getByLabel("Leverancier")).toHaveValue("Synthetische Voorbeeldwinkel Noord");
  await expect(page.getByText("Voorstel — nog niet gecontroleerd")).toBeVisible();
});

test("gebruiker corrigeert een voorstel en bevestigt gescheiden documentgegevens", async ({ page }) => {
  await loginAsTestUser(page);
  await uploadAndOpenProposal(page, "synthetic-correct-confirm.pdf");
  await page.getByLabel("Leverancier").fill("Gecorrigeerde synthetische leverancier");
  await page.getByRole("button", { name: "Corrigeren en bevestigen" }).click();
  await expect(page.getByText("Gecontroleerde documentgegevens opgeslagen.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Afzonderlijk opgeslagen bevestigde gegevens" })).toBeVisible();
  await expect(page.getByText("Gecorrigeerde synthetische leverancier")).toBeVisible();
});

test("documentenlijst toont een upload en laat het voorstel opnieuw openen", async ({ page }) => {
  await loginAsTestUser(page);
  await uploadAndOpenProposal(page, "synthetic-document-list.pdf");
  await page.goto("/receipts");
  await expect(page.getByRole("cell", { name: /synthetic-document-list\.pdf/i })).toBeVisible();
  await page.getByRole("button", { name: "Openen" }).first().click();
  await expect(page).toHaveURL(/\/receipts\?review=/);
  await expect(page.getByRole("heading", { name: "Mock-OCR-voorstel" })).toBeVisible();
});


async function uploadWithoutMockProposal(page: Page, filename: string): Promise<string> {
  const response = await page.request.post(`${baseUrl}/api/receipts`, {
    multipart: {
      file: { name: filename, mimeType: "application/pdf", buffer: syntheticPdf },
    },
  });
  expect(response.status()).toBe(201);
  const payload = await response.json() as { receipt?: { id: string }; mockOcrCreated?: boolean };
  expect(payload.receipt?.id).toBeTruthy();
  expect(payload.mockOcrCreated).toBe(false);
  return payload.receipt!.id;
}

test("gebruiker kan een mock-OCR-voorstel afwijzen zonder bevestigde waarden", async ({ page }) => {
  await loginAsTestUser(page);
  await uploadAndOpenProposal(page, "synthetic-reject-proposal.pdf");
  await page.getByRole("button", { name: "Voorstel afwijzen" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Afwijzen bevestigen" }).click();
  await expect(page.getByText("Voorstel afgewezen.")).toBeVisible();
  await expect(page.getByText(/Status: afgewezen/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Afzonderlijk opgeslagen bevestigde gegevens" })).toHaveCount(0);
});

test("gebruiker kan mock-OCR opnieuw proberen als het voorstel ontbreekt", async ({ page }) => {
  await loginAsTestUser(page);
  const receiptId = await uploadWithoutMockProposal(page, "synthetic-retry-proposal.pdf");
  await page.goto(`${baseUrl}/receipts?review=${receiptId}`);
  await expect(page.getByRole("heading", { name: "Mock-OCR opnieuw proberen" })).toBeVisible();
  await page.getByLabel("Synthetisch profiel").selectOption(fixtureId);
  await page.getByRole("button", { name: "Voorstel aanmaken" }).click();
  await expect(page.getByRole("heading", { name: "Mock-OCR-voorstel" })).toBeVisible();
});

test("ongeldige mock-OCR-fixture wordt geweigerd voordat een bestand wordt opgeslagen", async ({ page }) => {
  await loginAsTestUser(page);
  const response = await page.request.post(`${baseUrl}/api/receipts`, {
    multipart: {
      fixtureId: "not-a-committed-fixture",
      file: { name: "synthetic-invalid-fixture.pdf", mimeType: "application/pdf", buffer: syntheticPdf },
    },
  });
  expect(response.status()).toBe(400);
  const payload = await response.json() as { error?: string };
  expect(payload.error).toContain("mock-OCR-fixture");
});
