import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class OrderItem extends Model<InferAttributes<OrderItem>, InferCreationAttributes<OrderItem>> {
    declare order_id: string
    declare order_item_id: number
    declare product_id: string
    declare seller_id: string
    declare shipping_limit_date: Date
    declare price: number
    declare freight_value: CreationOptional<number>
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface OrderItemCreateRequest {
    order_id: string
    order_item_id: number
    product_id: string
    seller_id: string
    shipping_limit_date: Date
    price: number
    freight_value?: number
}

export interface OrderItemResponse extends AuditFields {
    order_id: string
    order_item_id: number
    product_id: string
    seller_id: string
    shipping_limit_date: Date
    price: number
    freight_value: number
}

export type OrderItemUpdateRequest = Partial<OrderItemCreateRequest>

OrderItem.init(
    {
        ...auditColumns,
        order_id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
        },
        order_item_id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
        },
        product_id: {
            type: DataTypes.CHAR(32),
            allowNull: false,
        },
        seller_id: {
            type: DataTypes.CHAR(32),
            allowNull: false,
        },
        shipping_limit_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        freight_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: "order_items",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
