import { Router, Request, Response } from 'express'
import { validateAdminToken } from '../../utils'
import { EmployeeToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'
const products = Router()
import * as multer from 'multer'
import * as R from 'ramda'
import * as crypto from 'crypto'

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `/home/tolis/Desktop/projects/cflp/cflp-server/src/images`)
  },
  filename: function(req, file, cb) {
    const [, type] = file.mimetype.split('/')
    cb(null, `${crypto.randomBytes(48).toString('hex')}.${type}`)
  }
})

const upload = multer({ storage })

products.get('/', validateAdminToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25 } = req.query
  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('products')
    .find({ storeId: user.storeId })
    .skip(+offset)
    .limit(+limit)
    .toArray()

  const total = await MongoHelper.db
    .collection('products')
    .find({ storeId: user.storeId })
    .count()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.send({ data, offset: +offset, limit: +limit, total })
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
  const user = req.user as EmployeeToken
  const { lpReward, name, price } = req.body
  console.log(lpReward, price, name)

  const error = {}
  if (lpReward < 0 || !Boolean(lpReward)) error['lpReward'] = 'loyalty points cant be empty or have negative value'
  if (price < 0 || !Boolean(price)) error['price'] = 'price cant be empty or have negative value'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })

  await MongoHelper.connect()
  const data = await MongoHelper.db.collection('products').insertOne({
    lpReward,
    name,
    price,
    storeId: user.storeId
  })

  res.json(data.ops[0])
})

products.post('/images', validateAdminToken, upload.array('image'), async (req: Request, res: Response) => {
  const { lpReward, price, name } = JSON.parse(req.body.infos)
  const paths = R.map((o: any) => R.prop('path', o), R.propOr([], 'files', req))
  console.log(paths)

  const error = {}
  if (+lpReward < 0 || !Boolean(lpReward)) error['lpReward'] = 'loyalty points cant be empty or have negative value'
  if (+price < 0 || !Boolean(price)) error['price'] = 'price cant be empty or have negative value'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })

  res.json({})
})

products.put('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

products.delete('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

export default products
