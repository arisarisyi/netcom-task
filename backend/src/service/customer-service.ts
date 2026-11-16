import { Customer, CustomerCreateRequest, CustomerResponse, CustomerUpdateRequest } from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import { ResponseError } from "../error/response-error";
import { buildSort, ListQuery, PaginatedResponse } from "../type/common";

const SORTABLE = [
    "customer_id",
    "customer_unique_id",
    "customer_zip_code_prefix",
    "customer_city",
    "customer_state",
] as const;

export class CustomerService {

    static async list(query: Record<string, unknown>): Promise<PaginatedResponse<CustomerResponse>> {
        const { page = 1, limit = 20, sort, dir } = Validation.validate(CustomerValidation.LIST, query) as ListQuery;
        const { rows, count } = await Customer.findAndCountAll({
            offset: (page - 1) * limit,
            limit,
            order: buildSort(SORTABLE, sort, dir, [["customer_id", "ASC"]]),
        });
        return { data: rows, page, limit, total: count, total_pages: Math.ceil(count / limit) };
    }

    static async get(id: string): Promise<CustomerResponse> {
        return this.findRow(id);
    }

    private static async findRow(id: string): Promise<Customer> {
        const customer = await Customer.findOne({ where: { customer_id: id } });
        if (!customer) throw new ResponseError(404, "Customer not found");
        return customer;
    }

    static async create(request: CustomerCreateRequest, userId?: string): Promise<CustomerResponse> {
        const data = Validation.validate(CustomerValidation.CREATE, request);
        return Customer.create({ ...data, created_by: userId ?? null });
    }

    static async update(id: string, request: CustomerUpdateRequest, userId?: string): Promise<CustomerResponse> {
        const data = Validation.validate(CustomerValidation.UPDATE, request);
        const customer = await this.findRow(id);
        await customer.update({ ...data, updated_by: userId ?? null });
        return customer;
    }

    static async remove(id: string, userId?: string): Promise<{ deleted: boolean }> {
        const customer = await this.findRow(id);
        customer.set("deleted_by", userId ?? null);
        await customer.destroy();
        return { deleted: true };
    }
}
