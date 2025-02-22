import { z } from "zod";

export const transactionSchema = z.object({
  property_id: z.number().int().positive("Property ID is required"),
  type: z.enum(["DEBIT", "CREDIT"], {
    errorMap: () => ({ message: "Type must be either 'DEBIT' or 'CREDIT'" }),
  }),
  description: z.string().min(5, "Description must be at least 5 characters"),
  amount: z.number().positive("Amount must be a positive number"),
});

export type TransactionType = z.infer<typeof transactionSchema>;
