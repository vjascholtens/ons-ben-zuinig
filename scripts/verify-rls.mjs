#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

function loadLocalEnv() {
  let text;
  try {
    text = readFileSync(".env.local", "utf8");
  } catch {
    return;
  }

  for (const line of text.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;

    const name = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseUrl = (process.env.OBZ_TEST_BASE_URL ?? "http://localhost:3000").replace(/\/$/u, "");

const requiredEnv = [
  ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishableKey],
  ["SUPABASE_SERVICE_ROLE_KEY (local test cleanup only)", serviceRoleKey],
  ["OBZ_TEST_USER_A_EMAIL", process.env.OBZ_TEST_USER_A_EMAIL],
  ["OBZ_TEST_USER_A_PASSWORD", process.env.OBZ_TEST_USER_A_PASSWORD],
  ["OBZ_TEST_USER_B_EMAIL", process.env.OBZ_TEST_USER_B_EMAIL],
  ["OBZ_TEST_USER_B_PASSWORD", process.env.OBZ_TEST_USER_B_PASSWORD],
  ["OBZ_TEST_USER_C_EMAIL", process.env.OBZ_TEST_USER_C_EMAIL],
  ["OBZ_TEST_USER_C_PASSWORD", process.env.OBZ_TEST_USER_C_PASSWORD],
];

const missing = requiredEnv.filter(([, value]) => !value).map(([name]) => name);
if (missing.length) {
  console.error(
    "Supabase RLS-test niet gestart. Ontbrekende lokale variabelen:\n" +
      missing.map((name) => `- ${name}`).join("\n"),
  );
  console.error("Gebruik uitsluitend een apart prototypeproject en synthetische data.");
  console.error("❌ [CFG-002] Supabase RLS-test niet uitgevoerd; EINDSTATUS=NOT_RUN; CHECKS=0; MISLUKT=0; EXITCODE=2");
  process.exit(2);
}

const supabase = (key) =>
  createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

const anonymousClient = supabase(publishableKey);
const adminClient = supabase(serviceRoleKey);
const createdReceiptIds = new Set();
const results = [];
const failures = [];
const PDF_BYTES = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n",
  "ascii",
);
const RUN_TAG = `obz-rls-test-${Date.now()}-${randomUUID().slice(0, 8)}`;

function errorCode(name) {
  return `RLS-${createHash("sha256").update(name).digest("hex").slice(0, 6).toUpperCase()}`;
}

function printSummary() {
  console.log("\n=== OBZ LIVE RLS-SAMENVATTING (kopieer dit blok) ===");
  if (results.length === 0) {
    console.log("❌ [CFG-002] Geen checks uitgevoerd; controleer configuratie en startvoorwaarden.");
  }
  for (const result of results) {
    const code = result.ok ? "OK-000" : errorCode(result.name);
    console.log(`${result.ok ? "✅" : "❌"} [${code}] ${result.name}${result.error ? ` — ${result.error}` : ""}`);
  }
  console.log(`EINDSTATUS=${failures.length ? "FAIL" : "PASS"}; CHECKS=${results.length}; MISLUKT=${failures.length}; EXITCODE=${failures.length ? 1 : 0}`);
}

async function check(name, fn) {
  try {
    const detail = await fn();
    if (detail === false) throw new Error("assertie niet geslaagd");
    results.push({ name, ok: true });
    console.log(`PASS  ${name}`);
    return detail;
  } catch (error) {
    const message =
      error instanceof Error ? error.message.slice(0, 180) : "onbekende fout";
    failures.push({ name, message });
    results.push({ name, ok: false, error: message });
    console.error(`FAIL  [${errorCode(name)}] ${name}: ${message}`);
    return undefined;
  }
}

function newCookieStore() {
  const values = new Map();
  return {
    getAll() {
      return [...values.entries()].map(([name, value]) => ({ name, value }));
    },
    setAll(cookies) {
      for (const cookie of cookies) {
        if (cookie.options?.maxAge === 0 || cookie.value === "") {
          values.delete(cookie.name);
        } else {
          values.set(cookie.name, cookie.value);
        }
      }
    },
    header() {
      return [...values.entries()]
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
    },
  };
}

async function signInContext(label) {
  const suffix = `OBZ_TEST_USER_${label}`;
  const email = process.env[`${suffix}_EMAIL`];
  const password = process.env[`${suffix}_PASSWORD`];
  const cookies = newCookieStore();
  const serverClient = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (values) => cookies.setAll(values),
    },
  });

  const { data, error } = await serverClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session || !data.user) {
    throw new Error(`Testgebruiker ${label} kon niet inloggen; controleer dashboard-account en wachtwoord.`);
  }

  const userClient = supabase(publishableKey);
  const { error: sessionError } = await userClient.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  if (sessionError) throw new Error(`Sessie voor testgebruiker ${label} kon niet worden ingesteld.`);

  return {
    label,
    id: data.user.id,
    client: userClient,
    cookies,
  };
}

async function callApp(context, path, init = {}) {
  const headers = new Headers(init.headers ?? {});
  if (context?.cookies?.header()) headers.set("cookie", context.cookies.header());
  return fetch(`${baseUrl}${path}`, { ...init, headers, redirect: "manual" });
}

function syntheticFile(bytes, filename, mimeType) {
  return new File([bytes], filename, { type: mimeType });
}

async function postReceipt(context, file) {
  const form = new FormData();
  form.set("file", file);
  const response = await callApp(context, "/api/receipts", {
    method: "POST",
    body: form,
  });
  let body = {};
  try {
    body = await response.json();
  } catch {
    // The assertion below will report the unexpected response status/body.
  }
  return { response, body };
}

async function getEntityId(context) {
  const { data, error } = await context.client
    .from("accounting_entities")
    .select("id")
    .eq("owner_user_id", context.id)
    .maybeSingle();
  if (error) throw new Error("Administratie kon niet worden opgehaald.");
  return data?.id ?? null;
}

async function listObjectNames(context, entityId) {
  const { data, error } = await context.client.storage
    .from("receipts")
    .list(`${context.id}/${entityId}`, { limit: 100 });
  if (error) throw new Error("Private Storage-lijst kon niet worden gelezen.");
  return new Set((data ?? []).map((entry) => entry.name));
}

async function getReceipt(context, receiptId) {
  const { data, error } = await context.client
    .from("receipts")
    .select("id, entity_id, uploaded_by, original_filename, storage_path, content_type, byte_size, sha256, status")
    .eq("id", receiptId)
    .maybeSingle();
  if (error) throw new Error("Documentrecord kon niet worden gecontroleerd.");
  return data;
}

async function tryCleanup() {
  if (createdReceiptIds.size === 0) return true;
  const ids = [...createdReceiptIds];
  const { data: rows, error: selectError } = await adminClient
    .from("receipts")
    .select("id, storage_path")
    .in("id", ids);

  if (selectError) {
    console.warn("WAARSCHUWING: testmetadata kon niet worden opgehaald voor opruiming.");
    return false;
  }

  const paths = (rows ?? []).map((row) => row.storage_path);
  if (paths.length) {
    const { error: removeError } = await adminClient.storage.from("receipts").remove(paths);
    if (removeError) {
      console.warn("WAARSCHUWING: een of meer synthetische testbestanden konden niet worden opgeruimd; metadata blijft behouden voor herstel.");
      return false;
    }
  }

  const { error: deleteError } = await adminClient
    .from("receipts")
    .delete()
    .in("id", ids);
  if (deleteError) {
    console.warn("WAARSCHUWING: testmetadata kon niet volledig worden opgeruimd.");
    return false;
  }

  console.log(`Opruiming: ${ids.length} aangemaakte testrecord(s) verwerkt.`);
  return true;
}

async function main() {
  if (!supabaseUrl.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL moet naar het prototypeproject verwijzen.");
  }

  const [userA, userB, userC] = await Promise.all([
    signInContext("A"),
    signInContext("B"),
    signInContext("C"),
  ]);

  if (new Set([userA.id, userB.id, userC.id]).size !== 3) {
    throw new Error("A, B en C moeten drie verschillende, aparte Supabase-testgebruikers zijn.");
  }

  const entityC = await getEntityId(userC);
  if (entityC) {
    throw new Error(
      "Testgebruiker C heeft al een administratie. Gebruik een nieuwe testgebruiker C zonder bestaande accounting_entity voor de first-upload-race-test.",
    );
  }

  // Fail early if the app is not running/configured. Anonymous routes must reject.
  await check("Niet-ingelogd: GET documentlijst geeft 401", async () => {
    const response = await callApp(null, "/api/receipts");
    return response.status === 401;
  });
  await check("Niet-ingelogd: POST upload geeft 401", async () => {
    const response = await callApp(null, "/api/receipts", {
      method: "POST",
      body: new FormData(),
    });
    return response.status === 401;
  });

  let entityA;
  let receiptA;
  await check("Eigenaar A: synthetische PDF uploadt via de applicatie", async () => {
    const { response, body } = await postReceipt(
      userA,
      syntheticFile(PDF_BYTES, `${RUN_TAG}-a.pdf`, "application/pdf"),
    );
    if (response.status !== 201 || !body.receipt?.id) {
      throw new Error(`verwachtte HTTP 201, kreeg HTTP ${response.status}`);
    }
    receiptA = body.receipt;
    createdReceiptIds.add(receiptA.id);
    return true;
  });

  await check("Eigenaar A: document verschijnt in de API-documentlijst", async () => {
    if (!receiptA) throw new Error("afhankelijk van geslaagde PDF-upload");
    const response = await callApp(userA, "/api/receipts");
    const body = await response.json();
    if (!response.ok || !body.receipts?.some((item) => item.id === receiptA.id)) {
      throw new Error("uploadrecord ontbreekt in de eigen lijst");
    }
    entityA = await getEntityId(userA);
    return Boolean(entityA);
  });

  let receiptJpeg;
  await check("Eigenaar A: synthetische JPEG uploadt via de applicatie", async () => {
    const { response, body } = await postReceipt(
      userA,
      syntheticFile(JPEG_BYTES, `${RUN_TAG}-a.jpg`, "image/jpeg"),
    );
    if (response.status !== 201 || !body.receipt?.id) {
      throw new Error(`verwachtte HTTP 201 voor JPEG, kreeg HTTP ${response.status}`);
    }
    receiptJpeg = body.receipt;
    createdReceiptIds.add(receiptJpeg.id);
    return true;
  });

  await check("API-response bevat geen publieke/download-URL", async () => {
    if (!receiptA) throw new Error("afhankelijk van geslaagde PDF-upload");
    const serialized = JSON.stringify(receiptA);
    return !serialized.includes(supabaseUrl) &&
      !Object.keys(receiptA).some((key) => /url/i.test(key));
  });

  let rowA;
  await check("Opslagpad gebruikt user-/entity-/document-ID's, niet de bestandsnaam", async () => {
    if (!receiptA || !entityA) throw new Error("afhankelijk van geslaagde eigenaarupload");
    rowA = await getReceipt(userA, receiptA.id);
    if (!rowA) throw new Error("eigen documentrecord is niet leesbaar");
    const expectedPrefix = `${userA.id}/${entityA}/`;
    if (!rowA.storage_path.startsWith(expectedPrefix)) throw new Error("opslagpad-prefix klopt niet");
    if (rowA.storage_path.includes(RUN_TAG)) throw new Error("originele testbestandsnaam lekt in het opslagpad");
    if (rowA.uploaded_by !== userA.id || rowA.entity_id !== entityA) {
      throw new Error("documentrecord hoort niet bij de ingelogde eigenaar");
    }
    return true;
  });

  await check("Gebruiker B: kan record A niet lezen", async () => {
    if (!receiptA) throw new Error("afhankelijk van geslaagde eigenaarupload");
    const { data, error } = await userB.client
      .from("receipts")
      .select("id")
      .eq("id", receiptA.id);
    if (error) throw new Error("RLS-testquery voor B gaf onverwacht een fout");
    return Array.isArray(data) && data.length === 0;
  });

  await check("Gebruiker B: kan object A niet downloaden", async () => {
    if (!rowA) throw new Error("afhankelijk van geslaagde eigenaarupload");
    const { data, error } = await userB.client.storage
      .from("receipts")
      .download(rowA.storage_path);
    return Boolean(error) && !data;
  });

  await check("Gebruiker B: kan niet uploaden naar administratie A", async () => {
    if (!entityA) throw new Error("afhankelijk van geslaagde eigenaarupload");
    const path = `${userA.id}/${entityA}/${randomUUID()}.pdf`;
    const { error } = await userB.client.storage
      .from("receipts")
      .upload(path, PDF_BYTES, { contentType: "application/pdf", upsert: false });
    if (!error) {
      await userB.client.storage.from("receipts").remove([path]);
      throw new Error("Storage accepteerde upload naar administratie van A");
    }
    return true;
  });

  await check("Gebruiker B: kan geen metadata aan administratie A koppelen", async () => {
    if (!entityA) throw new Error("afhankelijk van geslaagde eigenaarupload");
    const { error } = await userB.client.from("receipts").insert({
      id: randomUUID(),
      entity_id: entityA,
      uploaded_by: userB.id,
      original_filename: `${RUN_TAG}-cross-tenant.pdf`,
      storage_path: `${userA.id}/${entityA}/${randomUUID()}.pdf`,
      content_type: "application/pdf",
      byte_size: PDF_BYTES.length,
      sha256: createHash("sha256").update(PDF_BYTES).digest("hex"),
      status: "uploaded",
    });
    return Boolean(error);
  });

  await check("Anoniem: geen tabeltoegang tot documentmetadata", async () => {
    const { data, error } = await anonymousClient
      .from("receipts")
      .select("id")
      .limit(1);
    return Boolean(error) || (Array.isArray(data) && data.length === 0);
  });

  let beforeInvalid;
  if (entityA) {
    await check("Voorbereiding negatieve uploadtests: lees eigen objectlijst", async () => {
      beforeInvalid = await listObjectNames(userA, entityA);
      return true;
    });
  }

  await check("Verkeerd bestandstype wordt door API geweigerd", async () => {
    const { response } = await postReceipt(
      userA,
      syntheticFile(Buffer.from([0x4d, 0x5a, 0x90, 0x00]), `${RUN_TAG}.pdf`, "application/pdf"),
    );
    return response.status === 415;
  });

  await check("Lege payload wordt door API geweigerd", async () => {
    const { response } = await postReceipt(
      userA,
      syntheticFile(Buffer.alloc(0), `${RUN_TAG}-empty.pdf`, "application/pdf"),
    );
    return response.status === 400;
  });

  await check("Bestand groter dan 15 MiB wordt door API geweigerd", async () => {
    const oversized = Buffer.alloc(15 * 1024 * 1024 + 1, 0x41);
    const { response } = await postReceipt(
      userA,
      syntheticFile(oversized, `${RUN_TAG}-oversized.pdf`, "application/pdf"),
    );
    return response.status === 413;
  });

  if (entityA && beforeInvalid) {
    await check("Negatieve uploadtests laten geen nieuwe Storage-objecten achter", async () => {
      const after = await listObjectNames(userA, entityA);
      return [...after].every((name) => beforeInvalid.has(name));
    });
  }

  let concurrentReceipts = [];
  await check("Twee gelijktijdige eerste uploads maken één administratie en twee documenten", async () => {
    const uploads = await Promise.all([
      postReceipt(userC, syntheticFile(PDF_BYTES, `${RUN_TAG}-c1.pdf`, "application/pdf")),
      postReceipt(userC, syntheticFile(PDF_BYTES, `${RUN_TAG}-c2.pdf`, "application/pdf")),
    ]);
    for (const { response, body } of uploads) {
      if (response.status === 201 && body.receipt?.id) createdReceiptIds.add(body.receipt.id);
    }
    const failedUpload = uploads.find(({ response, body }) => response.status !== 201 || !body.receipt?.id);
    if (failedUpload) {
      throw new Error(`parallelle upload gaf HTTP ${failedUpload.response.status}`);
    }

    concurrentReceipts = uploads.map(({ body }) => body.receipt);

    const uniqueIds = new Set(concurrentReceipts.map((receipt) => receipt.id));
    if (uniqueIds.size !== 2) throw new Error("document-ID's zijn niet uniek");

    const [createdEntity, { data: rows, error }] = await Promise.all([
      getEntityId(userC),
      userC.client.from("receipts").select("id, entity_id, storage_path").in(
        "id",
        concurrentReceipts.map((receipt) => receipt.id),
      ),
    ]);
    if (!createdEntity || error || rows?.length !== 2) {
      throw new Error("niet beide documenten en de administratie zijn teruggevonden");
    }
    if (new Set(rows.map((row) => row.storage_path)).size !== 2) {
      throw new Error("Storage-paden zijn niet uniek");
    }
    if (rows.some((row) => row.entity_id !== createdEntity)) {
      throw new Error("documenten zijn aan verschillende administraties gekoppeld");
    }
    return true;
  });

  await check("Twee gelijktijdige uploads leveren beide records terug in de lijst", async () => {
    if (concurrentReceipts.length !== 2) throw new Error("afhankelijk van geslaagde concurrency-test");
    const response = await callApp(userC, "/api/receipts");
    const body = await response.json();
    return response.ok &&
      concurrentReceipts.every((receipt) => body.receipts?.some((row) => row.id === receipt.id));
  });

  const buckets = await adminClient.storage.listBuckets();
  await check("Storage-bucket receipts is aantoonbaar private met limiet en MIME-allowlist", async () => {
    if (buckets.error || !buckets.data) throw new Error("bucketconfiguratie kon niet worden gelezen");
    const bucket = buckets.data.find((item) => item.id === "receipts");
    if (!bucket) throw new Error("receipts-bucket ontbreekt");
    if (bucket.public !== false) throw new Error("receipts-bucket is publiek");
    if (bucket.file_size_limit !== 15 * 1024 * 1024) throw new Error("bucketlimiet wijkt af van 15 MiB");
    return Array.isArray(bucket.allowed_mime_types) &&
      bucket.allowed_mime_types.includes("application/pdf") &&
      bucket.allowed_mime_types.includes("image/jpeg");
  });

  const cleanupOk = await tryCleanup();
  if (cleanupOk) {
    results.push({ name: "Opruiming synthetische testdata", ok: true });
  } else {
    failures.push({ name: "Opruiming synthetische testdata", message: "opruiming niet volledig geslaagd" });
    results.push({ name: "Opruiming synthetische testdata", ok: false });
  }

  console.log("\nTestresultaat");
  console.table(results);
  printSummary();
  if (failures.length) process.exitCode = 1;
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : "onbekende fout";
  console.error("Test-run afgebroken:", message);
  failures.push({ name: "Test-run afgebroken", message });
  results.push({ name: "Test-run afgebroken", ok: false, error: message });
  process.exitCode = 1;
  await tryCleanup();
  printSummary();
});
