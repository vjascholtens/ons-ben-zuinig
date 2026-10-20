import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ReceiptRow = {
  id: string;
  original_filename: string;
  content_type: string;
  byte_size: number;
  status: string;
  created_at: string;
};

export function ReceiptsList({ receipts }: { receipts: ReceiptRow[] }) {
  if (!receipts.length) return <p className="p-6 text-sm text-neutral-500">Er zijn nog geen documenten opgeslagen.</p>;

  return (
    <Table>
      <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Datum</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actie</span></TableHead></TableRow></TableHeader>
      <TableBody>
        {receipts.map((receipt) => (
          <TableRow key={receipt.id}>
            <TableCell>
              <div className="font-medium">{receipt.original_filename}</div>
              <div className="text-xs text-neutral-500">{receipt.content_type} · {Math.max(1, Math.round(receipt.byte_size / 1024))} KB</div>
            </TableCell>
            <TableCell>{new Date(receipt.created_at).toLocaleDateString("nl-NL")}</TableCell>
            <TableCell><Badge variant={receipt.status === "needs_review" ? "outline" : "secondary"}>{receipt.status === "needs_review" ? "Controle nodig" : "Opgeslagen"}</Badge></TableCell>
            <TableCell><Link className="text-sm underline underline-offset-4" href={`/receipts/${receipt.id}`}>Openen</Link></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
