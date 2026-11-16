import {Response, Request, NextFunction} from "express";
import {ZodError} from "zod";
import {ResponseError} from "../error/response-error";

export const errorMiddleware = async (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
        }));

         res.status(400).json({
            message: 'Validation failed',
            errors: formattedErrors
        });
    } else if (error instanceof ResponseError) {
        res.status(error.status).json({
            errors: error.message
        });
    } else {
        res.status(500).json({
            errors: error.message
        });
    }
}
