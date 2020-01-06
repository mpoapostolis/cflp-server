import * as express from 'express'
import router from './routes'
import { RedisClient } from 'redis'

export const redis = new RedisClient({})
const PORT = process.env.PORT || 4000

const app = express()

app.use(express.json())

app.use(router)
app.use('/uploads', express.static(`/home/tolis/Desktop/uploads`))

app.listen(PORT, () => {
  app.locals.redis = redis
  console.log(`Server now listen at port: ${PORT}`)
})
