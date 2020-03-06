import { Router, Request, Response } from 'express'
import { validateAdminToken, generateSortFilter } from '../../utils'
import { MongoHelper } from '../../mongoHelper'
import { EmployeeToken } from 'models/users'
import { ObjectId } from 'mongodb'
import { subWeeks, addDays } from 'date-fns'

const transactions = Router()

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
    $project: {
      dateCreated: '$dateCreated',
      purchased: `$${type}.purchased`,
      name: `$${type}.name`,
      price: `$${type}.price`,
      lpPrice: `$${type}.lpPrice`,
      lpReward: `$${type}.lpReward`
    }
  }
]

transactions.get('/:id', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken
  const { id } = req.params
  const type = id === 'products' ? 'product' : 'offer'

  const {
    offset = 0,
    limit = 25,
    searchTerm = '',
    from = subWeeks(Date.now(), 1).getTime(),
    to = addDays(Date.now(), 1).getTime(),
    sortBy = 'date:DESC'
  } = req.query
  const sort = generateSortFilter(sortBy)

  console.log(from, to)
  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('transactions')
    .aggregate([
      {
        $match: {
          storeId: new ObjectId(user.storeId),
          dateCreated: { $gte: Number(from), $lte: Number(to) },
          [`${type}Id`]: { $exists: true }
        }
      },
      { $sort: sort },
      {
        $skip: +offset
      },
      { $limit: +limit },
      ...lookUp(type)
    ])
    .toArray()

  const total = await MongoHelper.db
    .collection('transactions')
    .find({
      storeId: new ObjectId(user.storeId),
      dateCreated: { $gte: new Date(from), $lte: new Date(to) },
      productId: { $exists: true }
    })
    .count()
    .catch(r => r)
  MongoHelper.client.close()

  res.json({ data, offset: +offset, limit: +limit, total })
})

transactions.post('/product', validateAdminToken, async (req: Request, res: Response) => {
  const { productId, userId } = req.body
  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const product = await MongoHelper.db.collection('products').findOne({ _id: new ObjectId(productId) })
  if (product.storeId === user.storeId) {
    await MongoHelper.db.collection('transactions').insertOne({
      productId: new ObjectId(productId),
      userId: new ObjectId(userId),
      storeId: new ObjectId(user.storeId),
      dateCreated: Date.now()
    })

    await MongoHelper.db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      {
        $inc: { purchased: 1 }
      }
    )
  }

  MongoHelper.client.close()

  res.json({
    msg: 'ok'
  })
})

transactions.post('/offer', validateAdminToken, async (req: Request, res: Response) => {
  const { offerId, userId } = req.body
  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const offer = await MongoHelper.db.collection('offers').findOne({ _id: new ObjectId(offerId) })
  //demo purpose FUTURE TODO:add transaction

  if (offer.storeId === user.storeId) {
    await MongoHelper.db.collection('transactions').insertOne({
      offerId: new ObjectId(offerId),
      userId: new ObjectId(userId),
      storeId: new ObjectId(user.storeId),
      dateCreated: new Date()
    })

    await MongoHelper.db.collection('offers').updateOne(
      { _id: new ObjectId(offerId) },
      {
        $inc: { purchased: 1 }
      }
    )
  }

  MongoHelper.client.close()

  res.json({
    msg: 'ok'
  })
})

transactions.post('/credit', validateAdminToken, async (req: Request, res: Response) => {
  res.json({})
})

export default transactions
