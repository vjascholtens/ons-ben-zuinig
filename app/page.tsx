import { ReceiptPicker } from "@/components/receipt-picker";

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

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><ReceiptIcon /></span>
          <span>Ons Ben Zuinig</span>
        </div>
        <span className="topbar-note">Een helder overzicht, stap voor stap</span>
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
        <div className="status-pill"><span className="status-dot" />Eerste prototype</div>
      </section>

      <div className="dashboard">
        <section className="card" aria-labelledby="receipts-title">
          <div className="card-heading">
            <div>
              <h2 id="receipts-title">Bonnetje toevoegen</h2>
              <p className="card-subtitle">Begin met een foto of kies een bestaand bestand.</p>
            </div>
            <span className="icon-badge"><ReceiptIcon /></span>
          </div>
          <ReceiptPicker />
          <div className="demo-warning" role="note">
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>Demo, nog geen veilige opslag</strong>
              Er wordt nog niets geüpload of opgeslagen. Uploaden, opslaan en OCR
              sluiten we pas aan na de opslag- en privacykeuzes.
            </div>
          </div>
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
