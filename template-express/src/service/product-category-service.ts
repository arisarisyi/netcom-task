import { ProductCategoryTranslation, ProductCategoryTranslationCreateRequest, ProductCategoryTranslationResponse, ProductCategoryTranslationUpdateRequest } from "../model/product-category-model";
import { ProductCategoryTranslationValidation } from "../validation/product-category-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "product_category_name",
    "product_category_name_english",
] as const;

export class ProductCategoryTranslationService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<ProductCategoryTranslationResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(ProductCategoryTranslationValidation.LIST, query) as ListQuery;
        const { rows, count } = await ProductCategoryTranslation.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["product_category_name", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(id: string): Promise<ProductCategoryTranslationResponse> {
        return this.findRow(id);
    }

    private static async findRow(id: string): Promise<ProductCategoryTranslation> {
        const productCategory = await ProductCategoryTranslation.findOne({ where: { product_category_name: id } });
        if (!productCategory) throw new ResponseError(404, "Product category not found");
        return productCategory;
    }

    static async create(request: ProductCategoryTranslationCreateRequest, userId?: string): Promise<ProductCategoryTranslationResponse> {
        const data = Validation.validate(ProductCategoryTranslationValidation.CREATE, request);
        return ProductCategoryTranslation.create({ ...data, created_by: userId ?? null });
    }

    static async update(id: string, request: ProductCategoryTranslationUpdateRequest, userId?: string): Promise<ProductCategoryTranslationResponse> {
        const data = Validation.validate(ProductCategoryTranslationValidation.UPDATE, request);
        const productCategory = await this.findRow(id);
        await productCategory.update({ ...data, updated_by: userId ?? null });
        return productCategory;
    }

    static async remove(id: string, userId?: string): Promise<{ deleted: boolean }> {
        const productCategory = await this.findRow(id);
        productCategory.set("deleted_by", userId ?? null);
        await productCategory.destroy();
        return { deleted: true };
    }
}
