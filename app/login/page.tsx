import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SignInForm } from "@/components/sign-in-form";

export const metadata = {
  title: "Inloggen",
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="app-shell auth-shell">
      <header className="topbar">
        <Link className="brand brand-link" href="/">
          <span className="brand-mark" aria-hidden="true">OBZ</span>
          <span>Ons Ben Zuinig</span>
        </Link>
        <span className="topbar-note">Veilig inloggen</span>
      </header>
      <section className="card auth-card">
        <div className="eyebrow">Persoonlijke administratie</div>
        <h1>Welkom terug.</h1>
        <p className="card-subtitle">
          Vraag een eenmalige inloglink aan voor een bestaand account.
        </p>
        {configured ? (
          <SignInForm />
        ) : (
          <div className="demo-warning">
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>Backend nog niet geconfigureerd</strong>
              Stel eerst de Supabase-project-URL en publishable key in via
              een lokaal <code>.env.local</code>-bestand. Er wordt nog geen account
              aangemaakt en er zijn geen echte documentuploads actief.
            </div>
          </div>
        )}
        <p className="auth-back"><Link href="/">Terug naar het startscherm</Link></p>
      </section>
    </main>
  );
}
