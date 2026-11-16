import { Product, ProductCreateRequest, ProductResponse, ProductUpdateRequest } from "../model/product-model";
import { ProductValidation } from "../validation/product-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "product_id",
    "product_category_name",
    "product_name_lenght",
    "product_description_lenght",
    "product_photos_qty",
    "product_weight_g",
    "product_length_cm",
    "product_height_cm",
    "product_width_cm",
] as const;

export class ProductService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<ProductResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(ProductValidation.LIST, query) as ListQuery;
        const { rows, count } = await Product.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["product_id", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(id: string): Promise<ProductResponse> {
        return this.findRow(id);
    }

    private static async findRow(id: string): Promise<Product> {
        const product = await Product.findOne({ where: { product_id: id } });
        if (!product) throw new ResponseError(404, "Product not found");
        return product;
    }

    static async create(request: ProductCreateRequest, userId?: string): Promise<ProductResponse> {
        const data = Validation.validate(ProductValidation.CREATE, request);
        return Product.create({ ...data, created_by: userId ?? null });
    }

    static async update(id: string, request: ProductUpdateRequest, userId?: string): Promise<ProductResponse> {
        const data = Validation.validate(ProductValidation.UPDATE, request);
        const product = await this.findRow(id);
        await product.update({ ...data, updated_by: userId ?? null });
        return product;
    }

    static async remove(id: string, userId?: string): Promise<{ deleted: boolean }> {
        const product = await this.findRow(id);
        product.set("deleted_by", userId ?? null);
        await product.destroy();
        return { deleted: true };
    }
}
