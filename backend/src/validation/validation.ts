import {z, ZodType} from "zod";

export const SortQuery = {
    sort: z.string().optional(),
    dir: z.enum(["asc", "desc"]).optional(),
};

export class Validation {

    static validate<T>(schema: ZodType, data: T): T {
        return schema.parse(data) as T;
    }

}
