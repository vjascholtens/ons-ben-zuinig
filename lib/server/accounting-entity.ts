import type { SupabaseClient } from "@supabase/supabase-js";

type AccountingEntityRow = { id: string };

/**
 * Ensures the authenticated user has an accounting entity.
 *
 * Two first-time uploads can race between the initial read and insert because
 * owner_user_id is unique. If another request wins that insert, re-read the
 * existing row rather than failing the losing upload.
 */
export async function getOrCreateAccountingEntity(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data: currentEntity, error: entityReadError } = await supabase
    .from("accounting_entities")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (entityReadError) return null;
  if (currentEntity) return (currentEntity as AccountingEntityRow).id;

  const { data: newEntity, error: entityCreateError } = await supabase
    .from("accounting_entities")
    .insert({ owner_user_id: userId, name: "Mijn administratie" })
    .select("id")
    .single();

  if (!entityCreateError && newEntity) {
    return (newEntity as AccountingEntityRow).id;
  }

  // A concurrent request may have created the unique owner row first.
  const { data: racedEntity, error: rereadError } = await supabase
    .from("accounting_entities")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (rereadError || !racedEntity) return null;
  return (racedEntity as AccountingEntityRow).id;
}
