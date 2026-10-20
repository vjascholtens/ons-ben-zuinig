import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  detectAllowedReceiptType: vi.fn(),
  getOrCreateAccountingEntity: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  getClaims: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));
vi.mock("@/lib/server/receipt-validation", () => ({
  detectAllowedReceiptType: mocks.detectAllowedReceiptType,
  MAX_RECEIPT_FILE_BYTES: 15 * 1024 * 1024,
}));
vi.mock("@/lib/server/accounting-entity", () => ({
  getOrCreateAccountingEntity: mocks.getOrCreateAccountingEntity,
}));
vi.mock("@/lib/supabase/env", () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

import { POST } from "../../app/api/receipts/route";

function makeRequest(): NextRequest {
  const body = new FormData();
  body.set(
    "file",
    new File([Buffer.from("%PDF-1.7\\nsynthetic test file\\n", "utf8")], "synthetic-test.pdf", {
      type: "application/pdf",
    }),
  );
  return new NextRequest("http://localhost/api/receipts", {
    method: "POST",
    body,
  });
}

describe("receipt metadata insert failure cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "11111111-1111-4111-8111-111111111111" } },
      error: null,
    });
    mocks.detectAllowedReceiptType.mockResolvedValue({
      mime: "application/pdf",
      extension: "pdf",
    });
    mocks.getOrCreateAccountingEntity.mockResolvedValue(
      "22222222-2222-4222-8222-222222222222",
    );
    mocks.upload.mockResolvedValue({ error: null });
    mocks.remove.mockResolvedValue({ error: null });
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "simulated metadata insert failure" },
    });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.insert.mockReturnValue({ select: mocks.select });
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.createClient.mockResolvedValue({
      auth: { getClaims: mocks.getClaims },
      storage: {
        from: () => ({ upload: mocks.upload, remove: mocks.remove }),
      },
      from: mocks.from,
    });
  });

  it("removes the stored object after a forced metadata insert failure", async () => {
    const response = await POST(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toMatch(/uploadbestand is opgeruimd/i);
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.remove).toHaveBeenCalledTimes(1);
    expect(mocks.remove.mock.calls[0]?.[0]).toEqual([
      expect.stringMatching(/^11111111-1111-4111-8111-111111111111[/]22222222-2222-4222-8222-222222222222[/].+[.]pdf$/),
    ]);
  });

  it("reports when best-effort cleanup itself fails", async () => {
    mocks.remove.mockResolvedValue({
      error: { message: "simulated storage cleanup failure" },
    });

    const response = await POST(makeRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toMatch(/tijdelijke upload kon niet worden opgeruimd/i);
    expect(mocks.remove).toHaveBeenCalledTimes(1);
  });
});
