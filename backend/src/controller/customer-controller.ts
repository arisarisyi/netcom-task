import { NextFunction, Request, Response } from "express";
import { CustomerCreateRequest, CustomerUpdateRequest } from "../model/customer-model";
import { CustomerService } from "../service/customer-service";
import { UserRequest } from "../type/user-request";

export class CustomerController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await CustomerService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await CustomerService.get(req.params.id as string);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as CustomerCreateRequest;
            const response = await CustomerService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as CustomerUpdateRequest;
            const response = await CustomerService.update(req.params.id as string, request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await CustomerService.remove(req.params.id as string, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
