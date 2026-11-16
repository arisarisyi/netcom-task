import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class CustomerValidation {

    static readonly CREATE = z.object({
        customer_id: z.string().min(1).max(32),
        customer_unique_id: z.string().min(1).max(32),
        customer_zip_code_prefix: z.string().min(1).max(10),
        customer_city: z.string().min(1).max(120),
        customer_state: z.string().length(2),
    });

    static readonly UPDATE: ZodType = CustomerValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
