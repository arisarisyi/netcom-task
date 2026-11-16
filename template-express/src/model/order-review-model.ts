import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class OrderReview extends Model<InferAttributes<OrderReview>, InferCreationAttributes<OrderReview>> {
    declare review_id: string
    declare order_id: string
    declare review_score: number
    declare review_comment_title: string | null
    declare review_comment_message: string | null
    declare review_creation_date: Date
    declare review_answer_timestamp: Date
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface OrderReviewCreateRequest {
    review_id: string
    order_id: string
    review_score: number
    review_comment_title?: string | null
    review_comment_message?: string | null
    review_creation_date: Date
    review_answer_timestamp: Date
}

export interface OrderReviewResponse extends AuditFields {
    review_id: string
    order_id: string
    review_score: number
    review_comment_title: string | null
    review_comment_message: string | null
    review_creation_date: Date
    review_answer_timestamp: Date
}

export type OrderReviewUpdateRequest = Partial<OrderReviewCreateRequest>

OrderReview.init(
    {
        ...auditColumns,
        review_id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.CHAR(32),
            allowNull: false,
        },
        review_score: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        review_comment_title: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        review_comment_message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        review_creation_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        review_answer_timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "order_reviews",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
