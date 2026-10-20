import { z } from "zod";
import { MAX_RECEIPT_FILE_BYTES } from "./limits";

export { MAX_RECEIPT_FILE_BYTES };

export const allowedReceiptMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
] as const;

export const receiptMimeTypeSchema = z.enum(allowedReceiptMimeTypes);
export const uploadSizeSchema = z.number().int().positive().max(MAX_RECEIPT_FILE_BYTES);

export const uploadInputSchema = z.object({
  contentType: receiptMimeTypeSchema,
  size: uploadSizeSchema,
}).strict();

export const vatTreatmentSchema = z.enum([
  "standard",
  "zero_rate",
  "exempt",
  "reverse_charge",
  "kor",
]);

export const decimalAmountSchema = z.string()
  .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, "Gebruik een niet-negatieve decimale string met maximaal twee decimalen.");

export const documentDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Gebruik de datum YYYY-MM-DD.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Vul een bestaande kalenderdatum in.");

const documentFields = {
  supplier: z.string().trim().min(1).max(200),
  documentDate: documentDateSchema,
  invoiceNumber: z.string().trim().max(120),
  netAmount: decimalAmountSchema,
  vatAmount: decimalAmountSchema,
  grossAmount: decimalAmountSchema,
  vatTreatment: vatTreatmentSchema,
  vatRate: z.enum(["0.00", "9.00", "21.00"]).nullable().optional(),
};

export const ocrProposalSchema = z.object({
  fixtureId: z.string().trim().min(1).max(100).optional(),
  ...documentFields,
  currencyCode: z.string().regex(/^[A-Z]{3}$/).optional(),
}).strict();

export const confirmedDocumentDataSchema = z.object({
  ...documentFields,
  currencyCode: z.string().regex(/^[A-Z]{3}$/).default("EUR"),
}).strict();

export const reviewActionInputSchema = z.object({
  receiptId: z.string().uuid(),
  decision: z.enum(["confirmed", "rejected"]),
}).strict();

export type UploadInput = z.infer<typeof uploadInputSchema>;
export type OcrProposal = z.infer<typeof ocrProposalSchema>;
export type ConfirmedDocumentData = z.infer<typeof confirmedDocumentDataSchema>;
export type ReviewActionInput = z.infer<typeof reviewActionInputSchema>;
