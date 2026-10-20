type ReceiptSummary = {
  id: string;
  original_filename: string;
  content_type: string;
  byte_size: number;
  status: string;
  created_at: string;
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReceiptList({ receipts }: { receipts: ReceiptSummary[] }) {
  if (receipts.length === 0) {
    return <p className="empty-list">Je opgeslagen documenten verschijnen hier.</p>;
  }

  return (
    <ul className="receipt-list">
      {receipts.map((receipt) => (
        <li className="receipt-item" key={receipt.id}>
          <span className="receipt-file-icon" aria-hidden="true">PDF</span>
          <span className="receipt-main">
            <strong>{receipt.original_filename}</strong>
            <span>{new Date(receipt.created_at).toLocaleDateString("nl-NL")} · {humanSize(receipt.byte_size)}</span>
          </span>
          <span className="receipt-status">{receipt.status === "uploaded" ? "Opgeslagen" : "Controle nodig"}</span>
        </li>
      ))}
    </ul>
  );
}
