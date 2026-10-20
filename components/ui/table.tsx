import type { HTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="[&_tr]:border-b [&_tr]:border-neutral-200" {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="[&_tr:last-child]:border-0" {...props} />;
}

export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="border-b border-neutral-200 transition-colors hover:bg-neutral-50" {...props} />;
}

export function TableHead(props: HTMLAttributes<HTMLTableCellElement>) {
  return <th className="h-10 px-3 text-left align-middle text-xs font-medium text-neutral-500" {...props} />;
}

export function TableCell(props: HTMLAttributes<HTMLTableCellElement>) {
  return <td className="p-3 align-middle" {...props} />;
}
