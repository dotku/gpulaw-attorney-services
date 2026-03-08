import { z } from "zod";

// ── Shared primitives ──
const id = z.string().cuid();
const shortText = z.string().min(1).max(255);
const longText = z.string().max(5000);

// ── Cases ──
export const createCaseSchema = z.object({
  title: shortText,
  clientName: shortText,
  category: z.string().max(100),
  description: longText.optional(),
  urgency: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const updateCaseSchema = z.object({
  title: shortText.optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  description: longText.optional(),
});

// ── Documents ──
export const createDocumentSchema = z.object({
  title: shortText,
  content: z.string().max(50000).optional(),
  caseId: id.optional(),
  type: z.string().max(50).optional(),
});

export const updateDocumentSchema = z.object({
  title: shortText.optional(),
  content: z.string().max(50000).optional(),
});

export const generateDocumentSchema = z.object({
  documentType: z.string().min(1).max(100),
  jurisdiction: z.string().max(100).optional(),
  language: z.enum(["en", "zh-CN", "zh-TW"]).optional(),
  context: z.string().max(5000).optional(),
});

// ── Profile ──
export const updateProfileSchema = z.object({
  name: shortText.optional(),
  phone: z.string().max(20).optional().nullable(),
  locale: z.enum(["en", "zh-CN", "zh-TW"]).optional(),
});

// ── Billing ──
export const checkoutSchema = z.object({
  planId: shortText,
  interval: z.enum(["month", "year"]).optional(),
});

// ── Verification ──
export const submitVerificationSchema = z.object({
  barNumber: z.string().min(1).max(50),
  barState: z.string().length(2),
  firstName: shortText,
  lastName: shortText,
});

// ── Chat ──
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(10000),
  sessionId: id.optional(),
  category: z.string().max(50).optional(),
  locale: z.enum(["en", "zh-CN", "zh-TW"]).optional(),
});

// ── Admin ──
export const verificationActionSchema = z.object({
  lawyerId: id,
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(2000).optional(),
});

// ── Helper ──
export function parseOrError<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { error: msg };
  }
  return { data: result.data };
}
