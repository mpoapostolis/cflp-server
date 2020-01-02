import { Router, Request, Response } from 'express'
import { validateAdminToken } from '../../utils'
import { EmployeeToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'
const products = Router()
import * as multer from 'multer'

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname)
  },
  filename: function(req, file, cb) {
    const [, type] = file.mimetype.split('/')
    cb(null, `${file.fieldname}_${Date.now()}.${type}`)
  }
})

const upload = multer({ storage })

products.get('/', validateAdminToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25 } = req.query
  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('products')
    .find({ storesId: user.storeId })
    .skip(+offset)
    .limit(+limit)
    .toArray()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.send({ data })
})

products.get('/:id', validateAdminToken, async (req: Request, res: Response) => {
  const params = req.params
  await MongoHelper.connect()
  const data = await MongoHelper.db.collection('products').find({ _id: params.id })

  MongoHelper.client.close()
  res.send({ data })
  res.json({})
})

products.post('/', validateAdminToken, async (req: Request, res: Response) => {
  res.json({})
})

products.post('/images', validateAdminToken, upload.array('image'), async (req: Request, res: Response) => {
  res.json({})
})

products.put('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

products.delete('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

export default products
