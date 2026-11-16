import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"
import { AuditFields } from "../type/common"

export class Geolocation extends Model<InferAttributes<Geolocation>, InferCreationAttributes<Geolocation>> {
    declare geolocation_id: CreationOptional<number>
    declare geolocation_zip_code_prefix: string
    declare geolocation_lat: number
    declare geolocation_lng: number
    declare geolocation_city: string
    declare geolocation_state: string
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}


export interface GeolocationCreateRequest {
    geolocation_zip_code_prefix: string
    geolocation_lat: number
    geolocation_lng: number
    geolocation_city: string
    geolocation_state: string
}

export interface GeolocationResponse extends AuditFields {
    geolocation_id: number
    geolocation_zip_code_prefix: string
    geolocation_lat: number
    geolocation_lng: number
    geolocation_city: string
    geolocation_state: string
}

export type GeolocationUpdateRequest = Partial<GeolocationCreateRequest>

Geolocation.init(
    {
        ...auditColumns,
        geolocation_id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        geolocation_zip_code_prefix: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        geolocation_lat: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        geolocation_lng: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        geolocation_city: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        geolocation_state: {
            type: DataTypes.CHAR(2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "geolocation",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)
