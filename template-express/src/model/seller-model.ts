import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class Seller extends Model<InferAttributes<Seller>, InferCreationAttributes<Seller>> {
    declare seller_id: string
    declare seller_zip_code_prefix: string
    declare seller_city: string
    declare seller_state: string
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface SellerCreateRequest {
    seller_id: string
    seller_zip_code_prefix: string
    seller_city: string
    seller_state: string
}

export interface SellerResponse extends AuditFields {
    seller_id: string
    seller_zip_code_prefix: string
    seller_city: string
    seller_state: string
}

export type SellerUpdateRequest = Partial<SellerCreateRequest>

Seller.init(
    {
        ...auditColumns,
        seller_id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
        },
        seller_zip_code_prefix: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        seller_city: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        seller_state: {
            type: DataTypes.CHAR(2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "sellers",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
