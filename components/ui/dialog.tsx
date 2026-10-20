"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Dialog({ open, title, children, onOpenChange }: { open: boolean; title: string; children: ReactNode; onOpenChange: (open: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); if (!open && dialog.open) dialog.close(); }, [open]);
  return <dialog ref={ref} className="w-[min(92vw,28rem)] rounded-lg border border-neutral-200 p-0 shadow-xl backdrop:bg-black/40" onCancel={() => onOpenChange(false)} onClose={() => onOpenChange(false)}>
    <div className="grid gap-4 p-6"><h2 className="text-lg font-semibold">{title}</h2>{children}<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuleren</Button></div>
  </dialog>;
}
