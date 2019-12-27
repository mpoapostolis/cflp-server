import { Router, Request, Response } from 'express'
import { validateToken } from './auth'
import { tokenInfo } from '../models/users'
import { redis } from '..'
import { MongoHelper } from '../mongoHelper'

const offers = Router()

offers.get('/', validateToken, async (req: Request, res: Response) => {
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

offers.get('/:id/spent-lp', async (req: Request, res: Response) => {
  res.json({})
})

export default offers
