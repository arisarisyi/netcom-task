import {Response , NextFunction} from "express";
import {UserRequest} from "../type/user-request";
import jwt from "jsonwebtoken";
import {User, UserRow, Role} from "../model/user-model";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authMiddleware =  async (req:UserRequest,res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const user = await User.findByPk(payload.id, { attributes: { exclude: ["password"] } });
        req.user = user ? user.get({ plain: true }) as UserRow : undefined;
        next();
    } catch {
        return res.status(403).json({ message: 'Invalid token' });
    }
}

export const authorizeRole = (...roles: Role[]) => {
    return (req: UserRequest, res: Response, next: NextFunction) => {
        const allowed: Role[] = roles.includes("admin") ? roles : ["admin", ...roles];
        if (!req.user || !allowed.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: insufficient rights' });
            return;
        }
        next();
    };
};