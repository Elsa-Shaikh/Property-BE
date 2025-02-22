import { z } from "zod";

export const propertySchema = z.object({
  landlord_id: z.number().optional(),
  tenant_id: z.number().optional(),
  name: z.string().min(3, "Property name must be at least 3 characters"),
  rent_per_month: z.number().positive("Rent must be a positive number"),
  commission_percentage: z
    .number()
    .min(0, "Commission cannot be negative")
    .max(100, "Commission cannot exceed 100%"),
  user_id: z.number().optional(),
});

export type PropertyType = z.infer<typeof propertySchema>;
