import {z, ZodType} from "zod";

export class RevenueValidation {

    static readonly DAILY: ZodType = z.object({
        month: z.coerce.number().int().min(1).max(12),
        year: z.coerce.number().int().min(2000).max(2100),
    });

    static readonly ANOMALY: ZodType = z.object({
        month: z.coerce.number().int().min(1).max(12),
        year: z.coerce.number().int().min(2000).max(2100),
        threshold: z.coerce.number().min(0.1).max(10).default(2),
    });

}
