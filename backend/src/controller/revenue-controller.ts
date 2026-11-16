import {Request, Response, NextFunction} from "express";
import {RevenueService} from "../service/revenue-service";
import {logger} from "../application/logging";

export class RevenueController {

    static async dailyRevenue(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await RevenueService.dailyRevenue(req.query);
            logger.debug("response : " + JSON.stringify(response));
            res.status(200).json({
                data: response,
            });
        } catch (e) {
            next(e);
        }
    }

    static async dailyRevenueAnomalies(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await RevenueService.dailyRevenueAnomalies(req.query);
            logger.debug("response : " + JSON.stringify(response));
            res.status(200).json({
                data: response,
            });
        } catch (e) {
            next(e);
        }
    }

}
