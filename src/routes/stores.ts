import { Router, Request, Response } from 'express'
import { MongoHelper } from '../mongoHelper'
import { redis } from '..'
import { validateToken } from './auth'
import { tokenInfo } from '../models/users'

const stores = Router()

stores.get('/', validateToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25, lat = 0, lng = 0, id = '' } = req.query

  const user = req.user as tokenInfo
  redis.GEOADD('key', lat, lng, id)
  setTimeout(() => {
    redis.ZREM('key', id)
  }, 30000)
  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('stores')
    .find({ userId: user._id })
    .skip(+offset)
    .limit(+limit)
    .toArray()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.send({ data })
})

stores.get('/:id', async (req: Request, res: Response) => {
  await MongoHelper.connect()
  const results = await MongoHelper.db
    .collection('stores')
    .find({ id: +req.params.id })
    .toArray()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.json(results)
})

stores.post('/', async (req: Request, res: Response) => {
  res.json({})
})

stores.put('/:id', async (req: Request, res: Response) => {
  res.json({})
})

stores.delete('/:id', async (req: Request, res: Response) => {
  res.json({})
})

export default stores
