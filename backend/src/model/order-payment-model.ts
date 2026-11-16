import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class OrderPayment extends Model<InferAttributes<OrderPayment>, InferCreationAttributes<OrderPayment>> {
    declare order_id: string
    declare payment_sequential: number
    declare payment_type: string
    declare payment_installments: CreationOptional<number>
    declare payment_value: number
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface OrderPaymentCreateRequest {
    order_id: string
    payment_sequential: number
    payment_type: "credit_card" | "boleto" | "voucher" | "debit_card" | "not_defined"
    payment_installments?: number
    payment_value: number
}

export interface OrderPaymentResponse extends AuditFields {
    order_id: string
    payment_sequential: number
    payment_type: string
    payment_installments: number
    payment_value: number
}

export type OrderPaymentUpdateRequest = Partial<OrderPaymentCreateRequest>

OrderPayment.init(
    {
        ...auditColumns,
        order_id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
        },
        payment_sequential: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
        },
        payment_type: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        payment_installments: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1,
        },
        payment_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "order_payments",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
