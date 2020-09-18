import router from './routes'
import * as express from 'express'
import * as morgan from 'morgan'
require('dotenv').config()

const PORT = process.env.PORT || 4000

const app = express()

app.use(morgan('tiny'))

app.use(express.json())
app.use('/uploads/', express.static(process.env['UPLOAD_PATH']))

app.use(router)

app.listen(PORT, async () => {
  console.log(`Server now listen at port: ${PORT}`)
})
