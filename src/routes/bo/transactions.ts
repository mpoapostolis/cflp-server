import { Router, Request, Response } from 'express'
import { validateAdminToken, generateSortFilter } from '../../utils'
import { MongoHelper } from '../../mongoHelper'
import { EmployeeToken } from 'models/users'
import { ObjectId } from 'mongodb'
import { addWeeks } from 'date-fns/fp'
import { subWeeks } from 'date-fns'

const transactions = Router()

transactions.get('/products', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken

  const {
    offset = 0,
    limit = 25,
    searchTerm = '',
    from = subWeeks(Date.now(), 1).getTime(),
    to = addWeeks(2)(Date.now()),
    sortBy = 'date:DESC'
  } = req.query
  const sort = generateSortFilter(sortBy)

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
        $skip: +offset
      },
      { $limit: +limit },

      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },

      { $unwind: '$product' },
      {
        $project: {
          dateCreated: '$dateCreated',
          purchased: '$product.purchased',
          name: '$product.name',
          price: '$product.price',
          lpPrice: '$product.lpPrice',
          lpReward: '$product.lpReward'
        }
      }
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

transactions.get('/products/timeseries', validateAdminToken, async (req: Request, res: Response) => {
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
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },

      { $unwind: '$product' },
      {
        $project: {
          dateCreated: '$dateCreated',
          purchased: '$product.purchased',
          name: '$product.name',
          price: '$product.price',
          lpPrice: '$product.lpPrice',
          lpReward: '$product.lpReward'
        }
      }
    ])
    .toArray()
  MongoHelper.client.close()

  res.json({ data })
})

transactions.get('/offers', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken

  const {
    offset = 0,
    limit = 25,
    searchTerm = '',
    from = subWeeks(Date.now(), 1).getTime(),
    to = addWeeks(1)(Date.now()).getTime(),
    sortBy = 'date:DESC'
  } = req.query
  const sort = generateSortFilter(sortBy)

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('transactions')
    .aggregate([
      {
        $match: {
          storeId: new ObjectId(user.storeId),
          dateCreated: { $gte: new Date(from), $lte: new Date(to) },

          offerId: { $exists: true }
        }
      },
      {
        $skip: +offset
      },
      { $limit: +limit },

      {
        $lookup: {
          from: 'offers',
          localField: 'offerId',
          foreignField: '_id',
          as: 'offer'
        }
      },

      { $unwind: '$offer' },
      {
        $project: {
          dateCreated: '$dateCreated',
          name: '$offer.name',
          price: '$offer.price',
          lpPrice: '$offer.lpPrice',
          purchased: '$offer.purchased',
          lpReward: '$offer.lpReward'
        }
      }
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

transactions.get('/offers/timeseries', validateAdminToken, async (req: Request, res: Response) => {
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
          offerId: { $exists: true }
        }
      },

      {
        $lookup: {
          from: 'offers',
          localField: 'offerId',
          foreignField: '_id',
          as: 'offer'
        }
      },

      { $unwind: '$offer' },
      {
        $project: {
          dateCreated: '$dateCreated',
          name: '$offer.name',
          price: '$offer.price',
          lpPrice: '$offer.lpPrice',
          purchased: '$offer.purchased',
          lpReward: '$offer.lpReward'
        }
      }
    ])
    .toArray()
  MongoHelper.client.close()

  res.json({ data })
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
      dateCreated: new Date()
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
