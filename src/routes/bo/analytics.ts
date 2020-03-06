import { Router, Request, Response } from 'express'
import { validateAdminToken } from '../../utils'
import { MongoHelper } from '../../mongoHelper'
import { EmployeeToken } from 'models/users'
import { ObjectId } from 'mongodb'
import { addWeeks } from 'date-fns/fp'
import { subWeeks } from 'date-fns'
import { redis } from '../../index'

const analytics = Router()

analytics.get('/timeseries/:type', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken
  const { from = subWeeks(Date.now(), 1).getTime(), to = addWeeks(1)(Date.now()).getTime() } = req.query
  const { type } = req.params

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('transactions')
    .aggregate([
      {
        $match: {
          storeId: new ObjectId(user.storeId),
          dateCreated: { $gte: new Date(from), $lte: new Date(to) },
          [`${type}Id`]: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$dateCreated' },
            month: { $month: '$dateCreated' },
            year: { $year: '$dateCreated' }
          },
          dateCreated: { $first: '$dateCreated' },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0
        }
      },
      { $sort: { dateCreated: -1 } }
    ])
    .toArray()
  MongoHelper.client.close()
  res.json({ data })
})

const lookUp = (type = 'product') => [
  {
    $lookup: {
      from: `${type}s`,
      localField: `${type}Id`,
      foreignField: '_id',
      as: `${type}`
    }
  },

  { $unwind: `$${type}` },

  {
    $group: {
      _id: `$${type}.name`,
      name: { $first: `$${type}.name` },
      price: { $first: `$${type}.price` },
      purchased: {
        $sum: 1
      }
    }
  },

  {
    $project: {
      _id: 0,
      price: 1,
      name: 1,
      purchased: 1
    }
  },
  { $sort: { purchased: -1 } }
]

analytics.get('/aggregation/:type', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken
  const { from = subWeeks(Date.now(), 1).getTime(), to = addWeeks(1)(Date.now()).getTime() } = req.query
  const { type } = req.params

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('transactions')
    .aggregate([
      {
        $match: {
          storeId: new ObjectId(user.storeId),
          dateCreated: { $gte: new Date(from), $lte: new Date(to) },
          [`${type}Id`]: { $exists: true }
        }
      },
      ...lookUp(type)
    ])
    .toArray()
  MongoHelper.client.close()
  res.json({ data })
})

analytics.get('/revenue', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken
  const { from = subWeeks(Date.now(), 1).getTime(), to = addWeeks(1)(Date.now()).getTime() } = req.query

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('transactions')
    .aggregate([
      {
        $match: {
          storeId: new ObjectId(user.storeId),
          dateCreated: { $gte: new Date(from), $lte: new Date(to) },
          productId: { $exists: true }
        }
      },
      {
        $lookup: {
          from: `products`,
          localField: `productId`,
          foreignField: '_id',
          as: `product`
        }
      },
      { $unwind: `$product` },

      {
        $group: {
          _id: null,
          revenue: {
            $sum: '$product.price'
          }
        }
      }
    ])
    .toArray()
  MongoHelper.client.close()
  res.json({ revenue: data[0]?.revenue ?? 0 })
})

analytics.get('/near', validateAdminToken, async (req: Request, res: Response) => {
  const { near = 2 } = req.query
  redis.GEORADIUS('near', 0, 0, 500000, 'km', (err, data) => {
    res.json({ data })
  })
})

analytics.get('/near/total', validateAdminToken, async (req: Request, res: Response) => {
  const { near = 2 } = req.query
  redis.GEORADIUS('near', 0, 0, 500000, 'km', (err, data) => {
    res.json({ total: data.length })
  })
})

export default analytics