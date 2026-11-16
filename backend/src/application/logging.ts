import winston from "winston";
import * as dotenv from "dotenv";
dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL;

export const logger = winston.createLogger({
    level: LOG_LEVEL || 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({})
    ]
})
