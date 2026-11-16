import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class ProductCategoryTranslation extends Model<InferAttributes<ProductCategoryTranslation>, InferCreationAttributes<ProductCategoryTranslation>> {
    declare product_category_name: string
    declare product_category_name_english: string
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface ProductCategoryTranslationCreateRequest {
    product_category_name: string
    product_category_name_english: string
}

export interface ProductCategoryTranslationResponse extends AuditFields {
    product_category_name: string
    product_category_name_english: string
}

export type ProductCategoryTranslationUpdateRequest = Partial<ProductCategoryTranslationCreateRequest>

ProductCategoryTranslation.init(
    {
        ...auditColumns,
        product_category_name: {
            type: DataTypes.STRING(80),
            primaryKey: true,
        },
        product_category_name_english: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "product_category_translation",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
