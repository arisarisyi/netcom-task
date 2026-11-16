import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
    declare customer_id: string
    declare customer_unique_id: string
    declare customer_zip_code_prefix: string
    declare customer_city: string
    declare customer_state: string
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface CustomerCreateRequest {
    customer_id: string
    customer_unique_id: string
    customer_zip_code_prefix: string
    customer_city: string
    customer_state: string
}

export interface CustomerResponse extends AuditFields {
    customer_id: string
    customer_unique_id: string
    customer_zip_code_prefix: string
    customer_city: string
    customer_state: string
}

export type CustomerUpdateRequest = Partial<CustomerCreateRequest>

Customer.init(
    {
        ...auditColumns,
        customer_id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
        },
        customer_unique_id: {
            type: DataTypes.CHAR(32),
            allowNull: false,
        },
        customer_zip_code_prefix: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        customer_city: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        customer_state: {
            type: DataTypes.CHAR(2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "customers",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
