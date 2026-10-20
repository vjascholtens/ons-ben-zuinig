import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptReviewForm, type ReviewDraft } from "@/features/receipts/receipt-review-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  if (authError || typeof claims?.claims?.sub !== "string") redirect("/login");

  const { data: receipt, error } = await supabase.from("receipts")
    .select("id, original_filename, content_type, byte_size, status, created_at")
    .eq("id", id).maybeSingle();
  if (error || !receipt) notFound();

  const { data: extraction } = await supabase.from("receipt_extractions")
    .select("proposal, confirmed_data, decision_status")
    .eq("receipt_id", id).maybeSingle();
  const proposal = extraction?.proposal ? extraction.proposal as ReviewDraft : null;

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-8">
      <Button variant="outline" className="w-fit"><Link href="/receipts">Terug naar documenten</Link></Button>
      <Card>
        <CardHeader><CardTitle>{receipt.original_filename}</CardTitle><p className="text-sm text-neutral-500">{receipt.content_type} · {new Date(receipt.created_at).toLocaleDateString("nl-NL")}</p></CardHeader>
        <CardContent><ReceiptReviewForm receiptId={receipt.id} proposal={proposal} /></CardContent>
      </Card>
    </main>
  );
}
