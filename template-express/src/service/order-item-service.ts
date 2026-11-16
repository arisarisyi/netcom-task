import { OrderItem, OrderItemCreateRequest, OrderItemResponse, OrderItemUpdateRequest } from "../model/order-item-model";
import { OrderItemValidation } from "../validation/order-item-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "order_id",
    "order_item_id",
    "product_id",
    "seller_id",
    "shipping_limit_date",
    "price",
    "freight_value",
] as const;

export class OrderItemService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<OrderItemResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(OrderItemValidation.LIST, query) as ListQuery;
        const { rows, count } = await OrderItem.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["order_id", "ASC"], ["order_item_id", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(orderId: string, orderItemId: number): Promise<OrderItemResponse> {
        return this.findRow(orderId, orderItemId);
    }

    private static async findRow(orderId: string, orderItemId: number): Promise<OrderItem> {
        const orderItem = await OrderItem.findOne({ where: { order_id: orderId, order_item_id: orderItemId } });
        if (!orderItem) throw new ResponseError(404, "Order item not found");
        return orderItem;
    }

    static async create(request: OrderItemCreateRequest, userId?: string): Promise<OrderItemResponse> {
        const data = Validation.validate(OrderItemValidation.CREATE, request);
        return OrderItem.create({ ...data, created_by: userId ?? null });
    }

    static async update(orderId: string, orderItemId: number, request: OrderItemUpdateRequest, userId?: string): Promise<OrderItemResponse> {
        const data = Validation.validate(OrderItemValidation.UPDATE, request);
        const orderItem = await this.findRow(orderId, orderItemId);
        await orderItem.update({ ...data, updated_by: userId ?? null });
        return orderItem;
    }

    static async remove(orderId: string, orderItemId: number, userId?: string): Promise<{ deleted: boolean }> {
        const orderItem = await this.findRow(orderId, orderItemId);
        orderItem.set("deleted_by", userId ?? null);
        await orderItem.destroy();
        return { deleted: true };
    }
}
