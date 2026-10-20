"use client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
type ReceiptRow = { id: string; original_filename: string; content_type: string; byte_size: number; status: string; created_at: string };
export function ReceiptsList({ receipts, selectedId }: { receipts: ReceiptRow[]; selectedId?: string }) {
  const router = useRouter();
  if (!receipts.length) return <p className="p-6 text-sm text-neutral-500">Er zijn nog geen documenten opgeslagen.</p>;
  return <Table><TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Datum</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actie</span></TableHead></TableRow></TableHeader>
    <TableBody>{receipts.map((r) => <TableRow key={r.id}>
      <TableCell><div className="font-medium">{r.original_filename}</div><div className="text-xs text-neutral-500">{r.content_type} · {Math.max(1, Math.round(r.byte_size / 1024))} KB</div></TableCell>
      <TableCell>{new Date(r.created_at).toLocaleDateString("nl-NL")}</TableCell>
      <TableCell><Badge variant={r.status === "needs_review" ? "outline" : "secondary"}>{r.status === "needs_review" ? "Controle nodig" : "Opgeslagen"}</Badge></TableCell>
      <TableCell><Button type="button" variant="outline" onClick={() => router.push(`/receipts?review=${r.id}`)} aria-current={selectedId === r.id ? "page" : undefined}>Openen</Button></TableCell>
    </TableRow>)}</TableBody></Table>;
}
