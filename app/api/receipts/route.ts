import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { detectAllowedReceiptType, MAX_RECEIPT_FILE_BYTES } from "@/lib/server/receipt-validation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getOrCreateAccountingEntity } from "@/lib/server/accounting-entity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "receipts";
const MAX_FILENAME_LENGTH = 200;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function safeOriginalFilename(value: string): string {
  const basename = value.split(/[\\/]/).pop() ?? "receipt";
  const sanitized = basename.replace(/[\x00-\x1f\x7f]/g, "_").trim();
  return (sanitized || "receipt").slice(0, MAX_FILENAME_LENGTH);
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return jsonError("De documentopslag is nog niet geconfigureerd.", 503);
  }

  const supabase = await createClient();
  const { data: claimData, error: authError } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (authError || typeof userId !== "string") {
    return jsonError("Log in om je documenten te bekijken.", 401);
  }

  const { data: entity, error: entityError } = await supabase
    .from("accounting_entities")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (entityError) {
    return jsonError("De administratie kon niet worden opgehaald.", 500);
  }
  if (!entity) {
    return NextResponse.json({ receipts: [] }, { headers: { "Cache-Control": "private, no-store" } });
  }

  const { data: receipts, error } = await supabase
    .from("receipts")
    .select("id, original_filename, content_type, byte_size, status, created_at")
    .eq("entity_id", entity.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return jsonError("De documentenlijst kon niet worden opgehaald.", 500);
  }

  return NextResponse.json(
    { receipts },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return jsonError("De documentopslag is nog niet geconfigureerd.", 503);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_RECEIPT_FILE_BYTES + 128 * 1024) {
    return jsonError("Het bestand is groter dan de limiet van 15 MB.", 413);
  }

  const supabase = await createClient();
  const { data: claimData, error: authError } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (authError || typeof userId !== "string") {
    return jsonError("Log in voordat je een bestand uploadt.", 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Het uploadformulier kon niet worden gelezen.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("Selecteer eerst een foto of PDF.", 400);
  }
  if (file.size <= 0) {
    return jsonError("Dit bestand lijkt leeg.", 400);
  }
  if (file.size > MAX_RECEIPT_FILE_BYTES) {
    return jsonError("Het bestand is groter dan de limiet van 15 MB.", 413);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = await detectAllowedReceiptType(bytes);
  if (!detected) {
    return jsonError("Het bestandstype kon niet veilig worden herkend. Gebruik een geldige PDF of ondersteunde foto.", 415);
  }

  const entityId = await getOrCreateAccountingEntity(supabase, userId);
  if (!entityId) {
    return jsonError("De administratie kon niet worden opgehaald of aangemaakt. Probeer het opnieuw.", 500);
  }

  const receiptId = randomUUID();
  const storagePath = `${userId}/${entityId}/${receiptId}.${detected.extension}`;
  const originalFilename = safeOriginalFilename(file.name);
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: detected.mime,
      cacheControl: "0",
      upsert: false,
    });

  if (storageError) {
    return jsonError("Het bestand kon niet veilig worden opgeslagen. Controleer de opslagconfiguratie.", 502);
  }

  const { data: receipt, error: insertError } = await supabase
    .from("receipts")
    .insert({
      id: receiptId,
      entity_id: entityId,
      uploaded_by: userId,
      original_filename: originalFilename,
      storage_path: storagePath,
      content_type: detected.mime,
      byte_size: bytes.byteLength,
      sha256,
      status: "uploaded",
    })
    .select("id, original_filename, content_type, byte_size, status, created_at")
    .single();

  if (insertError || !receipt) {
    // Best effort cleanup if metadata could not be committed.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return jsonError("Het documentrecord kon niet worden opgeslagen. Het uploadbestand is opgeruimd waar mogelijk.", 500);
  }

  return NextResponse.json(
    { receipt },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}
