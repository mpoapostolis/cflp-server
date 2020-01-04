import { Router, Request, Response } from 'express'
import { validateAdminToken } from '../../utils'
import { EmployeeToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'
import * as multer from 'multer'
import * as R from 'ramda'
import * as crypto from 'crypto'
import { ObjectID } from 'bson'
import * as fs from 'fs'
const products = Router()

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `/home/tolis/Desktop/projects/cflp/cflp-server/src/images`)
  },
  filename: function(req, file, cb) {
    const [, type] = file.mimetype.split('/')
    cb(null, `${crypto.randomBytes(18).toString('hex')}.${type}`)
  }
})

const upload = multer({ storage })

products.get('/', validateAdminToken, async (req: Request, res: Response) => {
  const {
    offset = 0,
    limit = 25,
    searchTerm = '',
    minLp = 0,
    maxLp = Infinity,
    minPrice = 0,
    maxPrice = Infinity
  } = req.query
  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('products')
    .find({
      storeId: user.storeId,
      name: { $regex: searchTerm, $options: 'i' },
      price: { $gt: +minPrice, $lt: +maxPrice },
      lpReward: { $gt: +minLp, $lt: +maxLp }
    })
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
  const product = await MongoHelper.db.collection('products').findOne({ _id: new ObjectID(params.id) })
  MongoHelper.client.close()
  res.json(product)
})

products.post('/', validateAdminToken, upload.array('image'), async (req: Request, res: Response) => {
  const { lpPrice, lpReward, price, name } = JSON.parse(req.body.infos)
  const user = req.user as EmployeeToken

  const error = {}
  if (+lpReward < 0 || !Boolean(lpReward)) error['lpReward'] = 'loyalty points cant be empty or have negative value'
  if (+price < 0 || !Boolean(price)) error['price'] = 'price cant be empty or have negative value'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })

  const images = R.map(
    (o: any) => R.prop('path', o).replace('/home/tolis/Desktop/projects/cflp/cflp-server/src', ''),
    R.propOr([], 'files', req)
  )

  await MongoHelper.connect()
  const nameAlreadyExists = await MongoHelper.db.collection('products').findOne({ name, storeId: user.storeId })
  if (nameAlreadyExists) {
    return res.status(400).json({ error: { name: 'name already exists' } })
  }
  const data = await MongoHelper.db.collection('products').insertOne({
    storeId: user.storeId,
    lpReward,
    name,
    price,
    lpPrice,
    images: images
  })
  MongoHelper.client.close()

  res.json(data.ops[0])
})

products.put('/:id', validateAdminToken, upload.array('image'), async (req: Request, res: Response) => {
  const { lpReward, price, lpPrice, name } = JSON.parse(req.body.infos)
  const user = req.user as EmployeeToken

  const error = {}
  if (+lpReward < 0 || !Boolean(lpReward)) error['lpReward'] = 'loyalty points cant be empty or have negative value'
  if (+price < 0 || !Boolean(price)) error['price'] = 'price cant be empty or have negative value'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })

  const images = R.map(
    (o: any) => R.prop('path', o).replace('/home/tolis/Desktop/projects/cflp/cflp-server/src', ''),
    R.propOr([], 'files', req)
  )

  await MongoHelper.connect()
  await MongoHelper.db.collection('products').updateOne(
    { _id: new ObjectID(req.params.id) },
    {
      $push: { images: { $each: images } },
      $set: {
        lpReward,
        lpPrice,
        name,
        price,
        storeId: user.storeId
      }
    }
  )
  MongoHelper.client.close()

  res.json({ msg: 'ok' })
})

products.delete('/:id/images', validateAdminToken, async (req: Request, res: Response) => {
  const { paths = [] } = req.body

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('products')
    .updateOne({ _id: new ObjectID(req.params.id) }, { $pull: { images: { $in: paths } } })

  paths.forEach(path => {
    fs.unlink(`/home/tolis/Desktop/projects/cflp/cflp-server/src/${path}`, err => {})
  })
  MongoHelper.client.close()

  res.json(data)
})

products.delete('/:id', validateAdminToken, async (req: Request, res: Response) => {
  await MongoHelper.connect()
  await MongoHelper.db.collection('products').deleteOne({ _id: new ObjectID(req.params.id) })

  MongoHelper.client.close()

  res.json({ msg: 'ok' })
})

export default products
