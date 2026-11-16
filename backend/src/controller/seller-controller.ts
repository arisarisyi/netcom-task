import { NextFunction, Request, Response } from "express";
import { SellerCreateRequest, SellerUpdateRequest } from "../model/seller-model";
import { SellerService } from "../service/seller-service";
import { UserRequest } from "../type/user-request";

export class SellerController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await SellerService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await SellerService.get(req.params.id as string);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as SellerCreateRequest;
            const response = await SellerService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as SellerUpdateRequest;
            const response = await SellerService.update(req.params.id as string, request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await SellerService.remove(req.params.id as string, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
