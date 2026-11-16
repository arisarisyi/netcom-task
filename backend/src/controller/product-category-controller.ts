import { NextFunction, Request, Response } from "express";
import { ProductCategoryTranslationCreateRequest, ProductCategoryTranslationUpdateRequest } from "../model/product-category-model";
import { ProductCategoryTranslationService } from "../service/product-category-service";
import { UserRequest } from "../type/user-request";

export class ProductCategoryTranslationController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await ProductCategoryTranslationService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await ProductCategoryTranslationService.get(req.params.id as string);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as ProductCategoryTranslationCreateRequest;
            const response = await ProductCategoryTranslationService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as ProductCategoryTranslationUpdateRequest;
            const response = await ProductCategoryTranslationService.update(req.params.id as string, request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await ProductCategoryTranslationService.remove(req.params.id as string, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
