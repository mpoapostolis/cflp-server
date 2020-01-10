import router from './routes'
import * as express from 'express'
import * as morgan from 'morgan'
import * as dotenv from 'dotenv'
// import { RedisClient } from 'redis'

dotenv.config()

// export const redis = new RedisClient({})
const PORT = process.env.PORT || 4000

const app = express()

app.use(morgan('tiny'))

app.use(express.json())

app.use(router)

app.use('/uploads', express.static(process.env['UPLOAD_PATH']))
app.listen(PORT, () => {
  // app.locals.redis = redis
  console.log(`Server now listen at port: ${PORT}`)
})
