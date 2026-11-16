import { Sequelize } from "sequelize"
import dotenv from "dotenv"
import { logger } from "../application/logging"

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    logger.error("DATABASE_URL tidak tersedia")
    process.exit(1)
}

const POOL_OPTIONS = {
    max: 10,
    idle: 20000,
    acquire: 30000,
}

export const sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres" as const,
    logging: false,
    pool: POOL_OPTIONS,
})

const connectDB = async () => {
    try {
        await sequelize.authenticate()
        logger.info(
            `PostgreSQL connected: ${sequelize.getDialect()} / ${sequelize.getDatabaseName()}`,
        )
    } catch (error) {
        logger.error("PostgreSQL connection error:", error)
        process.exit(1)
    }
}

export default connectDB
