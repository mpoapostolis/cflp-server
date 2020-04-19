import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'
import del from './delete'
import update from './update'
import create from './create'

const read = Router()

read.get('/', validateToken, async (req: Request, res: Response) => {
  const { searchTerm = '', limit = 10, skip = 0 } = req.query
  const db = await slourpDb()
  const collection = await db.collection('stores')
  const stores = await collection.find({ name: { $regex: searchTerm } })
  const total = await stores.count()
  const data = await stores
    .skip(+skip)
    .limit(+limit)
    .toArray()
  res.status(200).json({ data, total })
})

const stores = Router()

stores.use('/stores', create, read, update, del)

export default stores
