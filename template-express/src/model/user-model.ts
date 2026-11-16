import { randomBytes } from "node:crypto"
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from "sequelize"
import { sequelize } from "../config/db"
import { auditColumns } from "./audit-columns"

export type Role = "admin" | "customers" | "sellers"

export const generateUserId = (): string => randomBytes(16).toString("hex")

export interface IUser extends InferAttributes<User> {}

export type UserResponse = {
    email: string
    name: string
    token?: string
}

export type CreateUserRequest = {
    email: string
    name: string
    password: string
    role: Role
}

export type LoginUserRequest = {
    email: string
    password: string
}

export type UserRow = Omit<IUser, "password">

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<string>
    declare name: string
    declare email: string
    declare role: Role
    declare password: string
    declare created_by: string | null
    declare created_at: CreationOptional<Date>
    declare updated_by: string | null
    declare updated_at: CreationOptional<Date> | null
    declare deleted_by: string | null
    declare deleted_at: CreationOptional<Date> | null
}

User.init(
    {
        ...auditColumns,
        id: {
            type: DataTypes.CHAR(32),
            primaryKey: true,
            defaultValue: generateUserId,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        role: {
            type: DataTypes.ENUM("admin", "customers", "sellers"),
            allowNull: false,
            defaultValue: "customers",
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "users",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        paranoid: true,
    }
)

export function toUserResponse(user: IUser | UserRow): UserResponse {
    return {
        name: user.name,
        email: user.email,
    }
}
