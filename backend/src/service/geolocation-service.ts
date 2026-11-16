import { Geolocation, GeolocationCreateRequest, GeolocationResponse, GeolocationUpdateRequest } from "../model/geolocation-model";
import { GeolocationValidation } from "../validation/geolocation-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "geolocation_id",
    "geolocation_zip_code_prefix",
    "geolocation_lat",
    "geolocation_lng",
    "geolocation_city",
    "geolocation_state",
] as const;

export class GeolocationService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<GeolocationResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(GeolocationValidation.LIST, query) as ListQuery;
        const { rows, count } = await Geolocation.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["geolocation_id", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(id: number): Promise<GeolocationResponse> {
        return this.findRow(id);
    }

    private static async findRow(id: number): Promise<Geolocation> {
        const geolocation = await Geolocation.findOne({ where: { geolocation_id: id } });
        if (!geolocation) throw new ResponseError(404, "Geolocation not found");
        return geolocation;
    }

    static async create(request: GeolocationCreateRequest, userId?: string): Promise<GeolocationResponse> {
        const data = Validation.validate(GeolocationValidation.CREATE, request);
        return Geolocation.create({ ...data, created_by: userId ?? null });
    }

    static async update(id: number, request: GeolocationUpdateRequest, userId?: string): Promise<GeolocationResponse> {
        const data = Validation.validate(GeolocationValidation.UPDATE, request);
        const geolocation = await this.findRow(id);
        await geolocation.update({ ...data, updated_by: userId ?? null });
        return geolocation;
    }

    static async remove(id: number, userId?: string): Promise<{ deleted: boolean }> {
        const geolocation = await this.findRow(id);
        geolocation.set("deleted_by", userId ?? null);
        await geolocation.destroy();
        return { deleted: true };
    }
}
