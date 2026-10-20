import Link from "next/link";
import { ReceiptPicker } from "@/components/receipt-picker";
import { ReceiptList } from "@/components/receipt-list";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ReceiptSummary = {
  id: string;
  original_filename: string;
  content_type: string;
  byte_size: number;
  status: string;
  created_at: string;
};

function ReceiptIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.75h10a1 1 0 0 1 1 1v15.1l-2.5-1.6-3.5 1.6-3.5-1.6L6 19.85V4.75a1 1 0 0 1 1-1Z"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
      />
      <path d="M9 8h6M9 11.5h6M9 15h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  let authenticated = false;
  let storageReady = false;
  let receipts: ReceiptSummary[] = [];
  let setupMessage: string | null = null;

  if (configured) {
    const supabase = await createClient();
    const { data: claimData, error: claimError } = await supabase.auth.getClaims();
    const userId = claimData?.claims?.sub;

    if (!claimError && typeof userId === "string") {
      authenticated = true;
      const { data: entity, error: entityError } = await supabase
        .from("accounting_entities")
        .select("id")
        .eq("owner_user_id", userId)
        .maybeSingle();

      if (entityError) {
        setupMessage = "De opslagdatabase is nog niet klaar. Pas eerst de Supabase-migratie toe en controleer de RLS policies.";
      } else {
        storageReady = true;
        if (entity) {
          const { data, error } = await supabase
            .from("receipts")
            .select("id, original_filename, content_type, byte_size, status, created_at")
            .eq("entity_id", entity.id)
            .order("created_at", { ascending: false })
            .limit(30);

          if (error) {
            storageReady = false;
            setupMessage = "De documentenlijst is niet beschikbaar. Controleer de migratie en toegangsregels.";
          } else {
            receipts = (data ?? []) as ReceiptSummary[];
          }
        }
      }
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><ReceiptIcon /></span>
          <span>Ons Ben Zuinig</span>
        </div>
        <div className="topbar-actions">
          {authenticated ? (
            <form action="/auth/signout" method="post">
              <button className="text-button" type="submit">Uitloggen</button>
            </form>
          ) : configured ? (
            <Link className="text-button" href="/login">Inloggen</Link>
          ) : (
            <span className="topbar-note">Een helder overzicht, stap voor stap</span>
          )}
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow">Jouw administratie · startscherm</div>
          <h1 id="hero-title">Je administratie, weer helemaal bij.</h1>
          <p>
            Bewaar bonnetjes, houd facturen in beeld en bouw rustig aan een
            administratie die je kunt vertrouwen.
          </p>
        </div>
        <div className="status-pill">
          <span className="status-dot" />
          {authenticated ? "Beveiligde testopslag" : configured ? "Inloggen vereist" : "Lokale demo"}
        </div>
      </section>

      {setupMessage ? (
        <div className="error-message page-alert" role="alert">{setupMessage}</div>
      ) : null}

      <div className="dashboard">
        <section className="card" aria-labelledby="receipts-title">
          <div className="card-heading">
            <div>
              <h2 id="receipts-title">Bonnetje toevoegen</h2>
              <p className="card-subtitle">Begin met een foto of kies een bestaand bestand.</p>
            </div>
            <span className="icon-badge"><ReceiptIcon /></span>
          </div>

          {!configured ? (
            <>
              <ReceiptPicker mode="demo" />
              <div className="demo-warning" role="note">
                <span aria-hidden="true">ⓘ</span>
                <div>
                  <strong>Lokale demo — geen opslag</strong>
                  Deze versie kan lokaal een bestand selecteren, maar uploadt niets.
                  Stel eerst Supabase in en rond de privacy-/securitycontrole af.
                </div>
              </div>
            </>
          ) : authenticated && storageReady ? (
            <>
              <ReceiptPicker mode="authenticated" />
              <div className="demo-warning" role="note">
                <span aria-hidden="true">ⓘ</span>
                <div>
                  <strong>Prototype met testgegevens</strong>
                  Alleen gebruiken met synthetische testbestanden totdat regio,
                  verwerkersvoorwaarden, opslagbeleid en toegangstests zijn goedgekeurd.
                  OCR is nog niet aangesloten.
                </div>
              </div>
            </>
          ) : authenticated ? (
            <div className="demo-warning">
              De opslagdatabase is niet gereed. Upload is uitgeschakeld totdat de migratie en policies zijn gecontroleerd.
            </div>
          ) : (
            <div className="login-prompt">
              <p>Log in met je bestaande account om een bon op te slaan.</p>
              <Link className="upload-action" href="/login">Inloggen</Link>
              <p className="file-note">Nieuwe accounts worden niet vanuit deze app aangemaakt.</p>
            </div>
          )}
        </section>

        <section className="card" aria-labelledby="overview-title">
          <div className="card-heading">
            <div>
              <h2 id="overview-title">Jouw overzicht</h2>
              <p className="card-subtitle">De belangrijkste zaken op één plek.</p>
            </div>
          </div>
          <div className="kpi-list">
            <div className="kpi-row"><span className="kpi-label">Inkomsten</span><span className="kpi-value">Volgt na inrichting</span></div>
            <div className="kpi-row"><span className="kpi-label">Uitgaven</span><span className="kpi-value">Volgt na inrichting</span></div>
            <div className="kpi-row"><span className="kpi-label">Openstaande facturen</span><span className="kpi-value">Volgt na inrichting</span></div>
            <div className="kpi-row"><span className="kpi-label">Btw-overzicht</span><span className="kpi-value">Volgt na validatie</span></div>
          </div>
        </section>
      </div>

      {authenticated && storageReady ? (
        <section className="card saved-documents" aria-labelledby="saved-title">
          <div className="card-heading">
            <div>
              <h2 id="saved-title">Opgeslagen documenten</h2>
              <p className="card-subtitle">Private documenten die bij jouw administratie horen.</p>
            </div>
            <span className="document-count">{receipts.length}</span>
          </div>
          <ReceiptList receipts={receipts} />
        </section>
      ) : null}

      <section className="next-steps" aria-label="Komende onderdelen">
        <article className="mini-card">
          <span className="mini-number">01 · VASTLEGGEN</span>
          <h3>Bonnetjes & documenten</h3>
          <p>Documenten veilig bewaren, herkennen en later terugvinden.</p>
        </article>
        <article className="mini-card">
          <span className="mini-number">02 · VERWERKEN</span>
          <h3>Boekingen die kloppen</h3>
          <p>Financiële regels los van de interface, met tests en historie.</p>
        </article>
        <article className="mini-card">
          <span className="mini-number">03 · OPVOLGEN</span>
          <h3>Facturen & overzicht</h3>
          <p>Van verstuurde factuur tot betaling en maandelijkse samenvatting.</p>
        </article>
      </section>

      <footer className="page-footer">
        <span>Ons Ben Zuinig · prototype in ontwikkeling</span>
        <span>Op iPhone installeren? Open deze site in Safari en kies Deel → Zet op beginscherm.</span>
      </footer>
    </main>
  );
}
