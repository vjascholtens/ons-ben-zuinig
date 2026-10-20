"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { syntheticMockOcrFixtures } from "@/features/receipts/mock-ocr";

export function MockOcrRetry({ receiptId }: { receiptId: string }) {
  const router = useRouter();
  const [fixtureId, setFixtureId] = useState(syntheticMockOcrFixtures[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/receipts/${receiptId}/mock-ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixtureId }),
        cache: "no-store",
      });
      const payload: { error?: string } = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Het voorstel kon niet opnieuw worden gemaakt.");
        return;
      }
      setMessage("Het synthetische voorstel is opgeslagen.");
      router.refresh();
    } catch {
      setError("De verbinding mislukte. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-3 rounded-md border border-neutral-200 p-4" aria-labelledby="mock-ocr-retry-title">
      <h2 id="mock-ocr-retry-title" className="font-semibold">Mock-OCR opnieuw proberen</h2>
      <p className="text-sm text-neutral-600">Kies een synthetische fixture. De bronfoto wordt niet naar een OCR-dienst gestuurd.</p>
      <label htmlFor="retry-mock-ocr-fixture" className="text-sm font-medium">Synthetisch profiel</label>
      <select id="retry-mock-ocr-fixture" value={fixtureId} onChange={(event) => setFixtureId(event.target.value)} disabled={busy} className="min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm">
        {syntheticMockOcrFixtures.map((fixture) => <option key={fixture.id} value={fixture.id}>{fixture.label}</option>)}
      </select>
      <div><Button type="button" onClick={retry} disabled={busy || !fixtureId}>{busy ? "Bezig…" : "Voorstel aanmaken"}</Button></div>
      {message ? <p role="status" className="text-sm">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
