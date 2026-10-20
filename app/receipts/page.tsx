import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptReviewForm, type ReviewDraft } from "@/features/receipts/receipt-review-form";
import { ReceiptsList } from "@/features/receipts/receipts-list";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export default async function ReceiptsPage({ searchParams }: { searchParams: Promise<{ review?: string }> }) {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (authError || typeof userId !== "string") redirect("/login");
  const { data: entity, error: entityError } = await supabase.from("accounting_entities").select("id").eq("owner_user_id", userId).maybeSingle();
  if (entityError) throw new Error("De administratie kon niet worden geladen.");
  const { data: receipts, error } = entity
    ? await supabase.from("receipts").select("id, original_filename, content_type, byte_size, status, created_at").eq("entity_id", entity.id).order("created_at", { ascending: false }).limit(50)
    : { data: [], error: null };
  if (error) throw new Error("De documentenlijst kon niet worden geladen.");
  const selectedId = (await searchParams).review;
  const selected = (receipts ?? []).find((r) => r.id === selectedId);
  const { data: extraction } = selected ? await supabase.from("receipt_extractions").select("proposal").eq("receipt_id", selected.id).maybeSingle() : { data: null };
  return <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 sm:p-8">
    <div><h1 className="text-2xl font-semibold">Documenten</h1><p className="mt-1 text-sm text-neutral-600">Private documenten van jouw administratie.</p></div>
    <Card><CardHeader><CardTitle>Opgeslagen bonnen</CardTitle></CardHeader><CardContent><ReceiptsList receipts={receipts ?? []} selectedId={selectedId} /></CardContent></Card>
    {selected ? <Card><CardHeader><CardTitle>{selected.original_filename}</CardTitle></CardHeader><CardContent><ReceiptReviewForm receiptId={selected.id} proposal={extraction?.proposal ? extraction.proposal as ReviewDraft : null} /></CardContent></Card> : null}
  </main>;
}
