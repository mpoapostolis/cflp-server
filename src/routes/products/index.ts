import { ObjectID } from 'mongodb'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'
import create from './create'
import del from './delete'
import update from './update'

const read = Router()

read.get('/', validateToken, async (req: Request, res: Response) => {
  const { searchTerm = '', limit = 10, skip = 0, storeId = req.user.storeId } = req.query
  const db = await slourpDb()
  const collection = await db.collection('products')
  const products = await collection.find(
    { storeId: new ObjectID(`${storeId}`), name: { $regex: searchTerm } },
    { projection: { _id: 0, storeId: 0, analytics: 0 } }
  )
  const total = await products.count()
  const data = await products
    .skip(+skip)
    .limit(+limit)
    .toArray()

  res.status(200).json({ data, total })
})
const products = Router()

products.use('/products', create, read, update, del)

export default products
