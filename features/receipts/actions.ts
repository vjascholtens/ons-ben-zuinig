"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  confirmedDocumentDataSchema,
  ocrProposalSchema,
  reviewActionInputSchema,
} from "@/lib/validation/schemas";

export type ReviewActionState = { ok: boolean; message: string };
export async function saveReceiptReview(_previous: ReviewActionState, formData: FormData): Promise<ReviewActionState> {
  const actionInput = reviewActionInputSchema.safeParse({
    receiptId: formData.get("receiptId"),
    decision: formData.get("decision"),
  });
  if (!actionInput.success) return { ok: false, message: "Dit verzoek is ongeldig. Kies bevestigen of afwijzen." };
  const { receiptId, decision } = actionInput.data;
  const supabase = await createClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims(), userId = claims?.claims?.sub;
  if (authError || typeof userId !== "string") return { ok: false, message: "Log in om dit voorstel te beoordelen." };
  const { data: existing, error: lookupError } = await supabase.from("receipt_extractions").select("proposal").eq("receipt_id", receiptId).maybeSingle();
  if (lookupError || !existing) return { ok: false, message: "Er is nog geen opgeslagen voorstel voor dit document." };
  const proposalResult = ocrProposalSchema.safeParse(existing.proposal);
  if (!proposalResult.success) return { ok: false, message: "Het opgeslagen voorstel is ongeldig; maak opnieuw een voorstel aan." };
  let confirmedData: Record<string, string> | null = null;
  if (decision === "confirmed") {
    const confirmedResult = confirmedDocumentDataSchema.safeParse({
      supplier: formData.get("supplier"),
      documentDate: formData.get("documentDate"),
      invoiceNumber: formData.get("invoiceNumber") ?? "",
      netAmount: formData.get("netAmount"),
      vatAmount: formData.get("vatAmount"),
      grossAmount: formData.get("grossAmount"),
      vatTreatment: formData.get("vatTreatment"),
      currencyCode: formData.get("currencyCode") || "EUR",
    });
    if (!confirmedResult.success) {
      return { ok: false, message: "Controleer de leverancier, datum, btw-behandeling en bedragen; gebruik decimale strings." };
    }
    confirmedData = confirmedResult.data;
  }
  const { data: saved, error } = await supabase.from("receipt_extractions").update({ confirmed_data: confirmedData, decision_status: decision, reviewed_at: new Date().toISOString(), reviewed_by: userId, updated_at: new Date().toISOString() }).eq("receipt_id", receiptId).select("receipt_id").single();
  if (error || !saved) return { ok: false, message: "De controle kon niet veilig worden opgeslagen." };
  revalidatePath("/receipts");
  return { ok: true, message: decision === "confirmed" ? "Gecontroleerde documentgegevens opgeslagen." : "Voorstel afgewezen." };
}
