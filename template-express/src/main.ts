import app from "./application/app"
import { logger } from "./application/logging"

const HOST = process.env.HOST || "localhost"
const PORT = process.env.PORT || "3000"

app.listen(Number(PORT), HOST, () => {
  logger.info(`${HOST} on port ${PORT}`)
})
