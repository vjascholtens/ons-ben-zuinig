import { z } from "zod";

export const MAX_RECEIPT_FILE_BYTES = 15 * 1024 * 1024;
export const receiptMimeTypeSchema = z.enum([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export const uploadInputSchema = z.object({
  type: receiptMimeTypeSchema,
  size: z.number().int().positive().max(MAX_RECEIPT_FILE_BYTES),
});

const decimalAmountSchema = z.string().regex(
  /^\d{1,10}(?:\.\d{1,2})?$/,
  "Gebruik een bedrag als decimale string met maximaal twee decimalen.",
);

const documentDateSchema = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Vul een geldige datum in.");

export const vatTreatmentSchema = z.enum([
  "standard",
  "zero_rate",
  "exempt",
  "reverse_charge",
  "kor",
]);

export const ocrProposalSchema = z.object({
  supplier: z.string().trim().min(1).max(200),
  documentDate: documentDateSchema,
  invoiceNumber: z.string().trim().max(100),
  netAmount: decimalAmountSchema,
  vatAmount: decimalAmountSchema,
  grossAmount: decimalAmountSchema,
  vatTreatment: vatTreatmentSchema,
});

export const confirmedDocumentSchema = ocrProposalSchema.extend({
  currencyCode: z.literal("EUR").default("EUR"),
});

export type UploadInput = z.infer<typeof uploadInputSchema>;
export type OcrProposal = z.infer<typeof ocrProposalSchema>;
export type ConfirmedDocument = z.infer<typeof confirmedDocumentSchema>;
