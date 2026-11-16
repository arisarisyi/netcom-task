import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class ProductValidation {

    static readonly CREATE = z.object({
        product_id: z.string().min(1).max(32),
        product_category_name: z.string().min(1).max(80).nullish(),
        product_name_lenght: z.number().int().nullish(),
        product_description_lenght: z.number().int().nullish(),
        product_photos_qty: z.number().int().nonnegative().nullish(),
        product_weight_g: z.number().int().nonnegative().nullish(),
        product_length_cm: z.number().int().nullish(),
        product_height_cm: z.number().int().nullish(),
        product_width_cm: z.number().int().nullish(),
    });

    static readonly UPDATE: ZodType = ProductValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
