import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class OrderValidation {

    static readonly CREATE = z.object({
        order_id: z.string().min(1).max(32),
        customer_id: z.string().min(1).max(32),
        order_status: z.enum(["created", "approved", "invoiced", "processing", "shipped", "delivered", "canceled", "unavailable"]),
        order_purchase_timestamp: z.coerce.date(),
        order_approved_at: z.coerce.date().nullish(),
        order_delivered_carrier_date: z.coerce.date().nullish(),
        order_delivered_customer_date: z.coerce.date().nullish(),
        order_estimated_delivery_date: z.coerce.date(),
    });

    static readonly UPDATE: ZodType = OrderValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
        order_status: z
            .string()
            .optional()
            .refine(
                (value) =>
                    !value ||
                    value
                        .split(",")
                        .map((status) => status.trim())
                        .every((status) =>
                            ["created", "approved", "invoiced", "processing", "shipped", "delivered", "canceled", "unavailable"].includes(status)
                        ),
                { message: "invalid order status" }
            ),
    });

}
