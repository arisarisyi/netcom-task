import {Request,Response,NextFunction} from "express";
import {CreateUserRequest, LoginUserRequest} from "../model/user-model";
import {UserService} from "../service/user-service";
import {logger} from "../application/logging";

export class UserController {

    static async register(req: Request, res: Response, next: NextFunction) {
        try{
            const request : CreateUserRequest = req.body as CreateUserRequest;
            const response = await UserService.registerUser(request);
            logger.debug("response : " + JSON.stringify(response));
            res.status(201).json({
                data:response,
            });
        }catch (e){
            next(e);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction){
        try{
            const request : LoginUserRequest = req.body as LoginUserRequest;
            const response = await UserService.login(request);
            logger.debug("response : " + JSON.stringify(response));
            res.status(200).json({
                data:response,
            })
        }catch (e){
            next(e);
        }
    }
}