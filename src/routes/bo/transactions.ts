import { Router, Request, Response } from 'express'
import { validateToken } from '../auth'
import { MongoHelper } from '../../mongoHelper'

const transactions = Router()

transactions.get('/', validateToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25, from, to, storeId, userId } = req.query

  await MongoHelper.connect()
  const results = await MongoHelper.db
    .collection('transactions')
    .find({
      created_at: {
        $gte: new Date(from),
        $lt: new Date(to)
      }
    })
    .limit(limit)
    .skip(offset)
    .toArray()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.json(results)
})

transactions.post('/debit', validateToken, async (req: Request, res: Response) => {
  res.json({
    a: 1
  })
})

transactions.post('/credit', validateToken, async (req: Request, res: Response) => {
  res.json({})
})

export default transactions
