import router from './routes'
import * as express from 'express'
import * as morgan from 'morgan'
import * as dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 4000

const app = express()

app.use(morgan('tiny'))

app.use(express.json())

app.use(router)

app.listen(PORT, () => {
  console.log(`Server now listen at port: ${PORT}`)
})
