"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewActionState = { ok: boolean; message: string };
const decimalString = /^\d{1,10}(?:\.\d{1,2})?$/;
const treatments = new Set(["standard", "zero_rate", "exempt", "reverse_charge", "kor"]);

export async function saveReceiptReview(_previous: ReviewActionState, formData: FormData): Promise<ReviewActionState> {
  const receiptId = String(formData.get("receiptId") ?? ""), decision = String(formData.get("decision") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(receiptId)) return { ok: false, message: "Dit document-ID is ongeldig." };
  if (decision !== "confirmed" && decision !== "rejected") return { ok: false, message: "Kies bevestigen of afwijzen." };
  const supabase = await createClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims(), userId = claims?.claims?.sub;
  if (authError || typeof userId !== "string") return { ok: false, message: "Log in om dit voorstel te beoordelen." };
  const { data: existing, error: lookupError } = await supabase.from("receipt_extractions").select("receipt_id").eq("receipt_id", receiptId).maybeSingle();
  if (lookupError || !existing) return { ok: false, message: "Er is nog geen opgeslagen voorstel voor dit document." };

  let confirmedData: Record<string, string> | null = null;
  if (decision === "confirmed") {
    const value = (name: string) => String(formData.get(name) ?? "").trim();
    const supplier = value("supplier"), documentDate = value("documentDate"), invoiceNumber = value("invoiceNumber");
    const netAmount = value("netAmount"), vatAmount = value("vatAmount"), grossAmount = value("grossAmount"), vatTreatment = value("vatTreatment");
    const date = new Date(documentDate);
    if (!supplier || !/^\d{4}-\d{2}-\d{2}$/.test(documentDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== documentDate) return { ok: false, message: "Vul een leverancier en geldige datum in." };
    if (![netAmount, vatAmount, grossAmount].every((amount) => decimalString.test(amount))) return { ok: false, message: "Bedragen moeten decimale strings met maximaal twee decimalen zijn." };
    if (!treatments.has(vatTreatment)) return { ok: false, message: "Kies een geldige btw-behandeling." };
    confirmedData = { supplier, documentDate, invoiceNumber, netAmount, vatAmount, grossAmount, vatTreatment, currencyCode: "EUR" };
  }
  const { data: saved, error } = await supabase.from("receipt_extractions").update({ confirmed_data: confirmedData, decision_status: decision, reviewed_at: new Date().toISOString(), reviewed_by: userId, updated_at: new Date().toISOString() }).eq("receipt_id", receiptId).select("receipt_id").single();
  if (error || !saved) return { ok: false, message: "De controle kon niet veilig worden opgeslagen." };
  revalidatePath("/receipts"); revalidatePath(`/receipts?review=${receiptId}`);
  return { ok: true, message: decision === "confirmed" ? "Gecontroleerde documentgegevens opgeslagen." : "Voorstel afgewezen." };
}
