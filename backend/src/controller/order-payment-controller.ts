import { NextFunction, Request, Response } from "express";
import { OrderPaymentCreateRequest, OrderPaymentUpdateRequest } from "../model/order-payment-model";
import { OrderPaymentService } from "../service/order-payment-service";
import { UserRequest } from "../type/user-request";

export class OrderPaymentController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderPaymentService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderPaymentService.get(req.params.order_id as string, Number(req.params.payment_sequential));
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderPaymentCreateRequest;
            const response = await OrderPaymentService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as OrderPaymentUpdateRequest;
            const response = await OrderPaymentService.update(req.params.order_id as string, Number(req.params.payment_sequential), request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await OrderPaymentService.remove(req.params.order_id as string, Number(req.params.payment_sequential), (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
