import { NextFunction, Request, Response } from "express";
import { OrderReviewCreateRequest, OrderReviewUpdateRequest } from "../model/order-review-model";
import { OrderReviewService } from "../service/order-review-service";
import { UserRequest } from "../type/user-request";

export class OrderReviewController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderReviewService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderReviewService.get(req.params.id as string);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderReviewCreateRequest;
            const response = await OrderReviewService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderReviewUpdateRequest;
            const response = await OrderReviewService.update(req.params.id as string, request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderReviewService.remove(req.params.id as string, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
