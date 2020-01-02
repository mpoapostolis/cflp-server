import { Router, Request, Response } from 'express'
import { validateToken } from '../auth'
import { EmployeeToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'

const offers = Router()

offers.get('/offers', validateToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25 } = req.query
  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('offers')
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

offers.get('/offers/:id', validateToken, async (req: Request, res: Response) => {
  const params = req.params
  await MongoHelper.connect()
  const data = await MongoHelper.db.collection('offers').find({ _id: params.id })

  MongoHelper.client.close()
  res.send({ data })
  res.json({})
})

offers.put('/offers/:id', async (req: Request, res: Response) => {
  res.json({})
})

offers.delete('/offers/:id', async (req: Request, res: Response) => {
  res.json({})
})

export default offers
