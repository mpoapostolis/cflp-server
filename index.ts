import * as express from "express"
import router from "./routes"
import { RedisClient } from "redis"

export const redis = new RedisClient({})
const PORT = process.env.PORT || 3000

const app = express()

app.use(router)

app.listen(PORT, () => {
  app.locals.redis = redis
  console.log(`Server now listen at port: ${PORT}`)
})
