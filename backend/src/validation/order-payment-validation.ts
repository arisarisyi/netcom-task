import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class OrderPaymentValidation {

    static readonly CREATE = z.object({
        order_id: z.string().min(1).max(32),
        payment_sequential: z.number().int().positive(),
        payment_type: z.enum(["credit_card", "boleto", "voucher", "debit_card", "not_defined"]),
        payment_installments: z.number().int().nonnegative().default(1),
        payment_value: z.number().nonnegative(),
    });

    static readonly UPDATE: ZodType = OrderPaymentValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
