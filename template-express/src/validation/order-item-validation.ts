import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class OrderItemValidation {

    static readonly CREATE = z.object({
        order_id: z.string().min(1).max(32),
        order_item_id: z.number().int().nonnegative(),
        product_id: z.string().min(1).max(32),
        seller_id: z.string().min(1).max(32),
        shipping_limit_date: z.coerce.date(),
        price: z.number().nonnegative(),
        freight_value: z.number().nonnegative().default(0),
    });

    static readonly UPDATE: ZodType = OrderItemValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
