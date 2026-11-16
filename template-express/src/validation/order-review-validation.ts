import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class OrderReviewValidation {

    static readonly CREATE = z.object({
        review_id: z.string().min(1).max(32),
        order_id: z.string().min(1).max(32),
        review_score: z.number().int().min(1).max(5),
        review_comment_title: z.string().max(120).nullish(),
        review_comment_message: z.string().nullish(),
        review_creation_date: z.coerce.date(),
        review_answer_timestamp: z.coerce.date(),
    });

    static readonly UPDATE: ZodType = OrderReviewValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
