import { Router, Request, Response } from 'express'
import { redis } from '../..'
import { validateAdminToken, validateClientToken } from '../../utils'
import { ClientToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'
import { RedisClient } from 'redis'
import { exec } from 'child_process'

const stores = Router()

stores.get('/', async (req: Request, res: Response) => {
  const { lat = 0, gender, age, lng = 0, id = '' } = req.query
  const user = req.user as ClientToken

  redis.GEOADD('near', lat, lng, `${gender}_${age}_${id}`)
  exec(`sleep 1000; redis-cli zrem near f_25_${id}`)

  res.send('ok')
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
