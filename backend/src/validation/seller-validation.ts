import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class SellerValidation {

    static readonly CREATE = z.object({
        seller_id: z.string().min(1).max(32),
        seller_zip_code_prefix: z.string().min(1).max(10),
        seller_city: z.string().min(1).max(120),
        seller_state: z.string().length(2),
    });

    static readonly UPDATE: ZodType = SellerValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
