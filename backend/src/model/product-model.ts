import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    declare product_id: string
    declare product_category_name: string | null
    declare product_name_lenght: CreationOptional<number> | null
    declare product_description_lenght: CreationOptional<number> | null
    declare product_photos_qty: CreationOptional<number> | null
    declare product_weight_g: number | null
    declare product_length_cm: number | null
    declare product_height_cm: number | null
    declare product_width_cm: number | null
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface ProductCreateRequest {
    product_id: string
    product_category_name?: string | null
    product_name_lenght?: number | null
    product_description_lenght?: number | null
    product_photos_qty?: number | null
    product_weight_g?: number | null
    product_length_cm?: number | null
    product_height_cm?: number | null
    product_width_cm?: number | null
}

export interface ProductResponse extends AuditFields {
    product_id: string
    product_category_name: string | null
    product_name_lenght: number | null
    product_description_lenght: number | null
    product_photos_qty: number | null
    product_weight_g: number | null
    product_length_cm: number | null
    product_height_cm: number | null
    product_width_cm: number | null
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>

Product.init(
    {
        ...auditColumns,
        product_id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
        },
        product_category_name: {
            type: DataTypes.STRING(80),
            allowNull: true,
        },
        product_name_lenght: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        product_description_lenght: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        product_photos_qty: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        product_weight_g: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        product_length_cm: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        product_height_cm: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        product_width_cm: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "products",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
