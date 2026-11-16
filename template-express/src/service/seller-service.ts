import { Seller, SellerCreateRequest, SellerResponse, SellerUpdateRequest } from "../model/seller-model";
import { SellerValidation } from "../validation/seller-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "seller_id",
    "seller_zip_code_prefix",
    "seller_city",
    "seller_state",
] as const;

export class SellerService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<SellerResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(SellerValidation.LIST, query) as ListQuery;
        const { rows, count } = await Seller.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["seller_id", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(id: string): Promise<SellerResponse> {
        return this.findRow(id);
    }

    private static async findRow(id: string): Promise<Seller> {
        const seller = await Seller.findOne({ where: { seller_id: id } });
        if (!seller) throw new ResponseError(404, "Seller not found");
        return seller;
    }

    static async create(request: SellerCreateRequest, userId?: string): Promise<SellerResponse> {
        const data = Validation.validate(SellerValidation.CREATE, request);
        return Seller.create({ ...data, created_by: userId ?? null });
    }

    static async update(id: string, request: SellerUpdateRequest, userId?: string): Promise<SellerResponse> {
        const data = Validation.validate(SellerValidation.UPDATE, request);
        const seller = await this.findRow(id);
        await seller.update({ ...data, updated_by: userId ?? null });
        return seller;
    }

    static async remove(id: string, userId?: string): Promise<{ deleted: boolean }> {
        const seller = await this.findRow(id);
        seller.set("deleted_by", userId ?? null);
        await seller.destroy();
        return { deleted: true };
    }
}
