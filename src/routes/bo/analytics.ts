import { Router, Request, Response } from 'express'
import { validateAdminToken } from '../../utils'
import { MongoHelper } from '../../mongoHelper'
import { EmployeeToken } from 'models/users'
import { ObjectId } from 'mongodb'
import { addWeeks } from 'date-fns/fp'
import { subWeeks } from 'date-fns'

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
      purchased: {
        $sum: 1
      }
    }
  },

  {
    $project: {
      _id: 0,
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

export default analytics
