"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewActionState = { ok: boolean; message: string };

const decimalString = /^\d{1,10}(?:\.\d{1,2})?$/;
const treatments = new Set(["standard", "zero_rate", "exempt", "reverse_charge", "kor"]);

export async function saveReceiptReview(
  _previous: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const receiptId = formData.get("receiptId");
  const decision = formData.get("decision");
  if (typeof receiptId !== "string" || !/^[0-9a-f-]{36}$/i.test(receiptId)) {
    return { ok: false, message: "Dit document-ID is ongeldig." };
  }
  if (decision !== "confirmed" && decision !== "rejected") {
    return { ok: false, message: "Kies bevestigen of afwijzen." };
  }

  const supabase = await createClient();
  const { data: claimData, error: authError } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;
  if (authError || typeof userId !== "string") {
    return { ok: false, message: "Log in om dit voorstel te beoordelen." };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("receipt_extractions")
    .select("proposal")
    .eq("receipt_id", receiptId)
    .maybeSingle();
  if (lookupError || !existing) {
    return { ok: false, message: "Er is nog geen opgeslagen voorstel voor dit document." };
  }

  let confirmedData: Record<string, string> | null = null;
  if (decision === "confirmed") {
    const supplier = String(formData.get("supplier") ?? "").trim();
    const documentDate = String(formData.get("documentDate") ?? "");
    const invoiceNumber = String(formData.get("invoiceNumber") ?? "").trim();
    const netAmount = String(formData.get("netAmount") ?? "");
    const vatAmount = String(formData.get("vatAmount") ?? "");
    const grossAmount = String(formData.get("grossAmount") ?? "");
    const vatTreatment = String(formData.get("vatTreatment") ?? "");

    if (!supplier || !/^\d{4}-\d{2}-\d{2}$/.test(documentDate)) {
      return { ok: false, message: "Vul leverancier en een geldige datum in." };
    }
    if (![netAmount, vatAmount, grossAmount].every((amount) => decimalString.test(amount))) {
      return { ok: false, message: "Bedragen moeten decimale strings met maximaal twee decimalen zijn." };
    }
    if (!treatments.has(vatTreatment)) {
      return { ok: false, message: "Kies een geldige btw-behandeling." };
    }
    confirmedData = { supplier, documentDate, invoiceNumber, netAmount, vatAmount, grossAmount, vatTreatment, currencyCode: "EUR" };
  }

  const { error } = await supabase.from("receipt_extractions").upsert({
    receipt_id: receiptId,
    proposal: existing.proposal,
    confirmed_data: confirmedData,
    decision_status: decision,
    reviewed_at: new Date().toISOString(),
    reviewed_by: userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "receipt_id" });

  if (error) return { ok: false, message: "De controle kon niet veilig worden opgeslagen." };
  revalidatePath("/receipts");
  revalidatePath(`/receipts/${receiptId}`);
  return { ok: true, message: decision === "confirmed" ? "Gecontroleerde documentgegevens opgeslagen." : "Voorstel afgewezen." };
}
