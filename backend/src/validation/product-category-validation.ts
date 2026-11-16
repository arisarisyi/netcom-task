import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class ProductCategoryTranslationValidation {

    static readonly CREATE = z.object({
        product_category_name: z.string().min(1).max(80),
        product_category_name_english: z.string().min(1).max(80),
    });

    static readonly UPDATE: ZodType = ProductCategoryTranslationValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
