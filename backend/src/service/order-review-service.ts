import { OrderReview, OrderReviewCreateRequest, OrderReviewResponse, OrderReviewUpdateRequest } from "../model/order-review-model";
import { OrderReviewValidation } from "../validation/order-review-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "review_id",
    "order_id",
    "review_score",
    "review_creation_date",
    "review_answer_timestamp",
] as const;

export class OrderReviewService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<OrderReviewResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(OrderReviewValidation.LIST, query) as ListQuery;
        const { rows, count } = await OrderReview.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["review_id", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(id: string): Promise<OrderReviewResponse> {
        return this.findRow(id);
    }

    private static async findRow(id: string): Promise<OrderReview> {
        const orderReview = await OrderReview.findOne({ where: { review_id: id } });
        if (!orderReview) throw new ResponseError(404, "Order review not found");
        return orderReview;
    }

    static async create(request: OrderReviewCreateRequest, userId?: string): Promise<OrderReviewResponse> {
        const data = Validation.validate(OrderReviewValidation.CREATE, request);
        return OrderReview.create({ ...data, created_by: userId ?? null });
    }

    static async update(id: string, request: OrderReviewUpdateRequest, userId?: string): Promise<OrderReviewResponse> {
        const data = Validation.validate(OrderReviewValidation.UPDATE, request);
        const orderReview = await this.findRow(id);
        await orderReview.update({ ...data, updated_by: userId ?? null });
        return orderReview;
    }

    static async remove(id: string, userId?: string): Promise<{ deleted: boolean }> {
        const orderReview = await this.findRow(id);
        orderReview.set("deleted_by", userId ?? null);
        await orderReview.destroy();
        return { deleted: true };
    }
}
