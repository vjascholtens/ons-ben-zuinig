"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false,
        },
      });

      if (authError) {
        setError("De inloglink kon niet worden verstuurd. Controleer de instellingen of probeer het later opnieuw.");
        return;
      }

      setMessage("Als dit e-mailadres voor een bestaande gebruiker is ingesteld, ontvang je een inloglink. Open die link op hetzelfde apparaat of in dezelfde browser.");
    } catch {
      setError("Inloggen is op dit moment niet beschikbaar. Probeer het later opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="email">E-mailadres</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        maxLength={254}
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="jij@voorbeeld.nl"
      />
      <button className="upload-action auth-submit" type="submit" disabled={busy}>
        {busy ? "Inloglink aanvragen…" : "Stuur mij een inloglink"}
      </button>
      {message ? <p className="selection-message" role="status">{message}</p> : null}
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <p className="auth-footnote">
        Alleen bestaande accounts kunnen inloggen. Deze pagina maakt geen nieuwe gebruikers aan.
      </p>
    </form>
  );
}
