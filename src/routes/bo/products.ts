import { Router, Request, Response } from 'express'
import { validateAdminToken, generateSortFilter, uploadImg, resizeImage, getFileNameFromPath } from '../../utils'
import { EmployeeToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'
import * as R from 'ramda'
import { ObjectID } from 'bson'
import * as fs from 'fs'
const products = Router()

products.get('/', validateAdminToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25, searchTerm = '', sortBy = 'date:DESC' } = req.query
  const sort = generateSortFilter(sortBy)

  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('products')
    .find({
      storeId: user.storeId,
      name: { $regex: searchTerm, $options: 'i' }
    })
    .sort(sort)
    .skip(+offset)
    .limit(+limit)
    .toArray()
    .catch(console.log)

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

products.post('/', validateAdminToken, uploadImg, async (req: Request, res: Response) => {
  const { lpPrice = 0, lpReward = 0, price = 0, name = '' } = JSON.parse(req.body.infos)
  const user = req.user as EmployeeToken

  const error = {}
  if (+lpReward < 0 || !Boolean(lpReward)) error['lpReward'] = 'loyalty points cant be empty or have negative value'
  if (+price < 0 || !Boolean(price)) error['price'] = 'price cant be empty or have negative value'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })
  resizeImage(req)

  const files: any[] = R.propOr([], 'files', req)
  const images = files.map(o => `/uploads/${o.filename}`)

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
    images: images,
    purchased: 0
  })
  MongoHelper.client.close()

  res.json(data.ops[0])
})

products.put('/:id', validateAdminToken, uploadImg, async (req: Request, res: Response) => {
  const { lpReward, price, lpPrice, name } = JSON.parse(req.body.infos)
  const user = req.user as EmployeeToken

  const error = {}
  if (+lpReward < 0 || !Boolean(lpReward)) error['lpReward'] = 'loyalty points cant be empty or have negative value'
  if (+price < 0 || !Boolean(price)) error['price'] = 'price cant be empty or have negative value'
  if (!Boolean(name)) error['name'] = 'name cant be empty'
  if (!R.isEmpty(error)) return res.status(400).json({ error })
  resizeImage(req)

  const files: any[] = R.propOr([], 'files', req)
  const images = files.map(o => `/uploads/${o.filename}`)

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

  getFileNameFromPath(paths).forEach(fileName => {
    fs.unlink(`${process.env['UPLOAD_PATH']}/${fileName}`, err => {})
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
