import { OrderPayment, OrderPaymentCreateRequest, OrderPaymentResponse, OrderPaymentUpdateRequest } from "../model/order-payment-model";
import { OrderPaymentValidation } from "../validation/order-payment-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "order_id",
    "payment_sequential",
    "payment_type",
    "payment_installments",
    "payment_value",
] as const;

export class OrderPaymentService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<OrderPaymentResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(OrderPaymentValidation.LIST, query) as ListQuery;
        const { rows, count } = await OrderPayment.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["order_id", "ASC"], ["payment_sequential", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(orderId: string, paymentSequential: number): Promise<OrderPaymentResponse> {
        return this.findRow(orderId, paymentSequential);
    }

    private static async findRow(orderId: string, paymentSequential: number): Promise<OrderPayment> {
        const orderPayment = await OrderPayment.findOne({ where: { order_id: orderId, payment_sequential: paymentSequential } });
        if (!orderPayment) throw new ResponseError(404, "Order payment not found");
        return orderPayment;
    }

    static async create(request: OrderPaymentCreateRequest, userId?: string): Promise<OrderPaymentResponse> {
        const data = Validation.validate(OrderPaymentValidation.CREATE, request);
        return OrderPayment.create({ ...data, created_by: userId ?? null });
    }

    static async update(orderId: string, paymentSequential: number, request: OrderPaymentUpdateRequest, userId?: string): Promise<OrderPaymentResponse> {
        const data = Validation.validate(OrderPaymentValidation.UPDATE, request);
        const orderPayment = await this.findRow(orderId, paymentSequential);
        await orderPayment.update({ ...data, updated_by: userId ?? null });
        return orderPayment;
    }

    static async remove(orderId: string, paymentSequential: number, userId?: string): Promise<{ deleted: boolean }> {
        const orderPayment = await this.findRow(orderId, paymentSequential);
        orderPayment.set("deleted_by", userId ?? null);
        await orderPayment.destroy();
        return { deleted: true };
    }
}
