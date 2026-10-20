"use client";

import { useState, type ChangeEvent } from "react";
import { formatFileSize, getReceiptFileError, type ReceiptFileLike } from "@/lib/receipt-file";

export function ReceiptPicker() {
  const [selection, setSelection] = useState<ReceiptFileLike | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    setSelection(null);

    if (!file) return;

    const validationError = getReceiptFileError(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setSelection(file);
  }

  return (
    <div className="upload-zone">
      <div className="upload-illustration" aria-hidden="true">
        <svg width="29" height="29" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v3.75A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25V14.5"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3>Leg je eerste bonnetje klaar</h3>
      <p>Kies een foto of PDF. Op een telefoon kun je, afhankelijk van de browser, ook meteen de camera openen.</p>
      <div className="upload-control">
        <input
          id="receipt-file"
          className="visually-hidden"
          type="file"
          accept="image/*,application/pdf,.pdf"
          capture="environment"
          onChange={handleChange}
          aria-describedby="receipt-file-note"
        />
        <label className="upload-action" htmlFor="receipt-file">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v3.75A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25V14.5"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          Kies een bonnetje
        </label>
      </div>
      <p id="receipt-file-note" className="file-note">Afbeelding of PDF · maximaal 15 MB</p>
      {selection ? (
        <div className="selection-message" role="status">
          <strong>Bestand geselecteerd:</strong> {selection.name} ({formatFileSize(selection.size)}).
          Dit is alleen een lokale demo-selectie; het bestand is nog niet geüpload of opgeslagen.
        </div>
      ) : null}
      {error ? <div className="error-message" role="alert">{error}</div> : null}
    </div>
  );
}
