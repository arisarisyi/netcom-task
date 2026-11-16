import { NextFunction, Request, Response } from "express";
import { OrderCreateRequest, OrderUpdateRequest } from "../model/order-model";
import { OrderService } from "../service/order-service";
import { UserRequest } from "../type/user-request";

export class OrderController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderService.get(req.params.id as string);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderCreateRequest;
            const response = await OrderService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderUpdateRequest;
            const response = await OrderService.update(req.params.id as string, request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderService.remove(req.params.id as string, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
