import {z, ZodType} from "zod";
import { Role } from "../model/user-model";

export class UserValidation {

    static readonly REGISTER: ZodType = z.object({
        email: z.string().min(1).max(100),
        password: z.string().min(1).max(100),
        name: z.string().min(1).max(100),
        role: z.enum(["admin", "customers", "sellers"] as const satisfies readonly Role[]),
    });

    static readonly LOGIN: ZodType = z.object({
        email: z.string().min(1).max(100),
        password: z.string().min(1).max(100)
    });

    static readonly UPDATE: ZodType = z.object({
        password: z.string().min(1).max(100).optional(),
        name: z.string().min(1).max(100).optional()
    });

}
