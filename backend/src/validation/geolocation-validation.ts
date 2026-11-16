import { z, ZodType } from "zod";
import { SortQuery } from "./validation";

export class GeolocationValidation {

    static readonly CREATE = z.object({
        geolocation_zip_code_prefix: z.string().min(1).max(10),
        geolocation_lat: z.number(),
        geolocation_lng: z.number(),
        geolocation_city: z.string().min(1).max(120),
        geolocation_state: z.string().length(2),
    });

    static readonly UPDATE: ZodType = GeolocationValidation.CREATE.partial();

    static readonly LIST: ZodType = z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        ...SortQuery,
    });

}
