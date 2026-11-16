import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
    declare order_id: string
    declare customer_id: string
    declare order_status: string
    declare order_purchase_timestamp: Date
    declare order_approved_at: CreationOptional<Date> | null
    declare order_delivered_carrier_date: CreationOptional<Date> | null
    declare order_delivered_customer_date: CreationOptional<Date> | null
    declare order_estimated_delivery_date: Date
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface OrderCreateRequest {
    order_id: string
    customer_id: string
    order_status: "created" | "approved" | "invoiced" | "processing" | "shipped" | "delivered" | "canceled" | "unavailable"
    order_purchase_timestamp: Date
    order_approved_at?: Date | null
    order_delivered_carrier_date?: Date | null
    order_delivered_customer_date?: Date | null
    order_estimated_delivery_date: Date
}

export interface OrderResponse extends AuditFields {
    order_id: string
    customer_id: string
    order_status: string
    order_purchase_timestamp: Date
    order_approved_at: Date | null
    order_delivered_carrier_date: Date | null
    order_delivered_customer_date: Date | null
    order_estimated_delivery_date: Date
}

export type OrderUpdateRequest = Partial<OrderCreateRequest>

Order.init(
    {
        ...auditColumns,
        order_id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
        },
        customer_id: {
            type: DataTypes.CHAR(32),
            allowNull: false,
        },
        order_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        order_purchase_timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        order_approved_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        order_delivered_carrier_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        order_delivered_customer_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        order_estimated_delivery_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "orders",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
