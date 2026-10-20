import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptsList } from "@/features/receipts/receipts-list";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = await createClient();
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (authError || typeof userId !== "string") redirect("/login");

  const { data: entity, error: entityError } = await supabase.from("accounting_entities")
    .select("id").eq("owner_user_id", userId).maybeSingle();
  if (entityError) throw new Error("De administratie kon niet worden geladen.");

  const { data: receipts, error } = entity
    ? await supabase.from("receipts").select("id, original_filename, content_type, byte_size, status, created_at")
        .eq("entity_id", entity.id).order("created_at", { ascending: false }).limit(50)
    : { data: [], error: null };
  if (error) throw new Error("De documentenlijst kon niet worden geladen.");

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Documenten</h1><p className="mt-1 text-sm text-neutral-600">Private documenten van jouw administratie.</p></div>
        <Link href="/" className="inline-flex min-h-9 items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100">Naar start</Link>
      </div>
      <Card><CardHeader><CardTitle>Opgeslagen bonnen</CardTitle></CardHeader><CardContent><ReceiptsList receipts={receipts ?? []} /></CardContent></Card>
    </main>
  );
}
