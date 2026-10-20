"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { formatFileSize, getReceiptFileError, type ReceiptFileLike } from "@/lib/receipt-file";

type ReceiptPickerProps = {
  mode: "demo" | "authenticated";
};

export function ReceiptPicker({ mode }: ReceiptPickerProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<ReceiptFileLike | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    setNotice(null);
    setSelection(null);

    if (!file) return;

    const validationError = getReceiptFileError(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setSelection(file);

    if (mode === "demo") {
      setNotice("Dit is alleen een lokale demo-selectie. Het bestand is niet geüpload of opgeslagen.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      const payload: { error?: string; receipt?: { original_filename: string } } = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Het bestand kon niet worden opgeslagen.");
        return;
      }

      setNotice(`Opgeslagen: ${payload.receipt?.original_filename ?? file.name}. OCR is nog niet aangesloten.`);
      router.refresh();
    } catch {
      setError("De upload is mislukt. Controleer de verbinding en probeer het opnieuw.");
    } finally {
      setUploading(false);
    }
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
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif"
          capture="environment"
          onChange={handleChange}
          disabled={uploading}
          aria-describedby="receipt-file-note"
        />
        <label className={`upload-action${uploading ? " is-disabled" : ""}`} htmlFor="receipt-file">
          {uploading ? "Bezig met uploaden…" : "Kies een bonnetje"}
        </label>
      </div>
      <p id="receipt-file-note" className="file-note">Afbeelding of PDF · maximaal 15 MB</p>
      {selection ? (
        <div className="selection-message" role="status">
          <strong>Geselecteerd:</strong> {selection.name} ({formatFileSize(selection.size)}).
          {uploading ? " Het bestand wordt veilig gecontroleerd en opgeslagen…" : ""}
        </div>
      ) : null}
      {notice ? <div className="selection-message" role="status">{notice}</div> : null}
      {error ? <div className="error-message" role="alert">{error}</div> : null}
    </div>
  );
}
