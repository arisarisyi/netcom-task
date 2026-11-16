import { Op } from "sequelize";
import { Order, OrderCreateRequest, OrderResponse, OrderUpdateRequest } from "../model/order-model";
import { OrderValidation } from "../validation/order-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "order_id",
    "customer_id",
    "order_status",
    "order_purchase_timestamp",
    "order_approved_at",
    "order_delivered_carrier_date",
    "order_delivered_customer_date",
    "order_estimated_delivery_date",
] as const;

export class OrderService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<OrderResponse>> {
        const { page = 1, limit = 20, order_status, sort, dir } = Validation.validate(OrderValidation.LIST, query) as ListQuery & {
            order_status?: string;
        };

        const where: Record<string, unknown> = {};
        if (order_status) {
            const statuses = order_status
                .split(",")
                .map((status) => status.trim())
                .filter(Boolean);
            where.order_status = statuses.length === 1 ? statuses[0] : { [Op.in]: statuses };
        }

        const { rows, count } = await Order.findAndCountAll({
            where,
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["order_purchase_timestamp", "DESC"], ["order_id", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(id: string): Promise<OrderResponse> {
        return this.findRow(id);
    }

    private static async findRow(id: string): Promise<Order> {
        const order = await Order.findOne({ where: { order_id: id } });
        if (!order) throw new ResponseError(404, "Order not found");
        return order;
    }

    static async create(request: OrderCreateRequest, userId?: string): Promise<OrderResponse> {
        const data = Validation.validate(OrderValidation.CREATE, request);
        return Order.create({ ...data, created_by: userId ?? null });
    }

    static async update(id: string, request: OrderUpdateRequest, userId?: string): Promise<OrderResponse> {
        const data = Validation.validate(OrderValidation.UPDATE, request);
        const order = await this.findRow(id);
        await order.update({ ...data, updated_by: userId ?? null });
        return order;
    }

    static async remove(id: string, userId?: string): Promise<{ deleted: boolean }> {
        const order = await this.findRow(id);
        order.set("deleted_by", userId ?? null);
        await order.destroy();
        return { deleted: true };
    }
}
