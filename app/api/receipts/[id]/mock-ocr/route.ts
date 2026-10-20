import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSyntheticMockOcrProposal } from "@/features/receipts/mock-ocr";
import { z } from "zod";

const retryInputSchema = z.object({ fixtureId: z.string().trim().min(1).max(100) }).strict();

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return jsonError("De documentopslag is nog niet geconfigureerd.", 503);

  const supabase = await createClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (authError || typeof userId !== "string") return jsonError("Log in om mock-OCR opnieuw te proberen.", 401);

  const { id: receiptId } = await params;
  if (!z.string().uuid().safeParse(receiptId).success) return jsonError("Dit document-ID is ongeldig.", 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Het verzoek kon niet worden gelezen.", 400);
  }
  const input = retryInputSchema.safeParse(body);
  if (!input.success) return jsonError("Kies een geldige synthetische fixture.", 400);
  const proposal = getSyntheticMockOcrProposal(input.data.fixtureId);
  if (!proposal) return jsonError("Deze mock-OCR-fixture bestaat niet.", 400);

  const { data: receipt, error: receiptError } = await supabase.from("receipts").select("id").eq("id", receiptId).maybeSingle();
  if (receiptError) return jsonError("Het document kon niet veilig worden gecontroleerd.", 500);
  if (!receipt) return jsonError("Document niet gevonden.", 404);

  const { data: existing, error: lookupError } = await supabase.from("receipt_extractions").select("receipt_id").eq("receipt_id", receiptId).maybeSingle();
  if (lookupError) return jsonError("De bestaande OCR-status kon niet worden gecontroleerd.", 500);
  if (existing) return jsonError("Er bestaat al een voorstel; opnieuw proberen zou de oorspronkelijke herkenning overschrijven.", 409);

  const { error: insertError } = await supabase.from("receipt_extractions").insert({
    receipt_id: receiptId,
    proposal,
    decision_status: "pending",
  });
  if (insertError) return jsonError("Het mock-OCR-voorstel kon niet worden opgeslagen. Probeer het opnieuw.", 500);

  return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
