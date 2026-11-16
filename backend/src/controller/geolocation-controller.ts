import { NextFunction, Request, Response } from "express";
import { GeolocationCreateRequest, GeolocationUpdateRequest } from "../model/geolocation-model";
import { GeolocationService } from "../service/geolocation-service";
import { UserRequest } from "../type/user-request";

export class GeolocationController {

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await GeolocationService.list(req.query as Record<string, unknown>);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await GeolocationService.get(Number(req.params.id as string));
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as GeolocationCreateRequest;
            const response = await GeolocationService.create(request, (req as UserRequest).user?.id);
            res.status(201).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const request = req.body as GeolocationUpdateRequest;
            const response = await GeolocationService.update(Number(req.params.id as string), request, (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await GeolocationService.remove(Number(req.params.id as string), (req as UserRequest).user?.id);
            res.status(200).json({ data: response });
        } catch (e) {
            next(e);
        }
    }
}
