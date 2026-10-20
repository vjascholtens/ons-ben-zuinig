"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { saveReceiptReview, type ReviewActionState } from "./actions";

export type ReviewDraft = { supplier?: string; documentDate?: string; invoiceNumber?: string; netAmount?: string; vatAmount?: string; grossAmount?: string; vatTreatment?: string };
const initialState: ReviewActionState = { ok: false, message: "" };
export function ReceiptReviewForm({ receiptId, proposal, confirmedData, decisionStatus }: { receiptId: string; proposal: ReviewDraft | null; confirmedData: ReviewDraft | null; decisionStatus: string }) {
  const [state, formAction, pending] = useActionState(saveReceiptReview, initialState);
  const [rejectOpen, setRejectOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null), rejectRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (state.message) state.ok ? toast.success(state.message) : toast.error(state.message); }, [state]);
  if (!proposal) return <p className="text-sm text-neutral-600">Er is nog geen mock-OCR-voorstel voor dit document. Gebruik uitsluitend een synthetische fixture en probeer de upload opnieuw.</p>;
  return <>
    <div className="grid gap-4">
      {decisionStatus === "confirmed" ? <p className="rounded-md border border-neutral-200 p-3 text-sm" role="status">Status: bevestigd. De oorspronkelijke mock-OCR-waarden hieronder zijn bewaard; de bevestigde waarden staan apart.</p> : decisionStatus === "rejected" ? <p className="rounded-md border border-neutral-200 p-3 text-sm" role="status">Status: afgewezen. Het oorspronkelijke voorstel blijft bewaard.</p> : null}
      <form ref={formRef} action={formAction} className="grid gap-4">
      <input type="hidden" name="receiptId" value={receiptId} />
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Mock-OCR-voorstel</h2><span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">{decisionStatus === "pending" ? "Voorstel — nog niet gecontroleerd" : "Oorspronkelijk voorstel — bewaard"}</span></div>
      <FormField label="Leverancier" htmlFor="supplier"><Input id="supplier" name="supplier" defaultValue={proposal.supplier ?? ""} required /></FormField>
      <FormField label="Documentdatum" htmlFor="documentDate"><Input id="documentDate" name="documentDate" type="date" defaultValue={proposal.documentDate ?? ""} required /></FormField>
      <FormField label="Factuurnummer" htmlFor="invoiceNumber"><Input id="invoiceNumber" name="invoiceNumber" defaultValue={proposal.invoiceNumber ?? ""} /></FormField>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Netto (€)" htmlFor="netAmount"><Input id="netAmount" name="netAmount" inputMode="decimal" defaultValue={proposal.netAmount ?? ""} required /></FormField>
        <FormField label="Btw (€)" htmlFor="vatAmount"><Input id="vatAmount" name="vatAmount" inputMode="decimal" defaultValue={proposal.vatAmount ?? ""} required /></FormField>
        <FormField label="Bruto (€)" htmlFor="grossAmount"><Input id="grossAmount" name="grossAmount" inputMode="decimal" defaultValue={proposal.grossAmount ?? ""} required /></FormField>
      </div>
      <FormField label="Btw-behandeling" htmlFor="vatTreatment"><select id="vatTreatment" name="vatTreatment" defaultValue={proposal.vatTreatment ?? "standard"} className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"><option value="standard">Standaardtarief (tarief nog controleren)</option><option value="zero_rate">Nultarief</option><option value="exempt">Vrijgesteld</option><option value="reverse_charge">Btw verlegd</option><option value="kor">KOR</option></select></FormField>
      <div className="flex flex-wrap gap-2"><Button type="submit" name="decision" value="confirmed" disabled={pending}>{pending ? "Opslaan…" : "Corrigeren en bevestigen"}</Button><Button type="button" variant="outline" onClick={() => setRejectOpen(true)} disabled={pending}>Voorstel afwijzen</Button><button hidden ref={rejectRef} type="submit" name="decision" value="rejected" /></div>
      </form>
      {confirmedData && decisionStatus === "confirmed" ? (
        <section className="rounded-md border border-neutral-200 p-4" aria-labelledby="confirmed-data-title">
          <h3 id="confirmed-data-title" className="font-semibold">Afzonderlijk opgeslagen bevestigde gegevens</h3>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-neutral-500">Leverancier</dt><dd>{confirmedData.supplier}</dd></div>
            <div><dt className="text-neutral-500">Documentdatum</dt><dd>{confirmedData.documentDate}</dd></div>
            <div><dt className="text-neutral-500">Factuurnummer</dt><dd>{confirmedData.invoiceNumber || "—"}</dd></div>
            <div><dt className="text-neutral-500">Netto / btw / bruto</dt><dd>€ {confirmedData.netAmount} / € {confirmedData.vatAmount} / € {confirmedData.grossAmount}</dd></div>
            <div><dt className="text-neutral-500">Btw-behandeling</dt><dd>{confirmedData.vatTreatment}</dd></div>
          </dl>
        </section>
      ) : null}
      <Dialog open={rejectOpen} title="Voorstel afwijzen?" onOpenChange={setRejectOpen}><p className="text-sm text-neutral-600">Het oorspronkelijke voorstel blijft bewaard; er worden geen bevestigde waarden opgeslagen.</p><Button type="button" variant="destructive" onClick={() => { setRejectOpen(false); if (rejectRef.current) formRef.current?.requestSubmit(rejectRef.current); }}>Afwijzen bevestigen</Button></Dialog>
    </div>
  </>;
}
