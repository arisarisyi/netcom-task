import { NextFunction, Request, Response } from "express";
import { OrderItemCreateRequest, OrderItemUpdateRequest } from "../model/order-item-model";
import { OrderItemService } from "../service/order-item-service";
import { UserRequest } from "../type/user-request";

export class OrderItemController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderItemService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderItemService.get(req.params.order_id as string, Number(req.params.order_item_id));
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderItemCreateRequest;
            const response = await OrderItemService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderItemUpdateRequest;
            const response = await OrderItemService.update(req.params.order_id as string, Number(req.params.order_item_id), request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderItemService.remove(req.params.order_id as string, Number(req.params.order_item_id), (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
