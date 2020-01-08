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
    from = subWeeks(Date.now(), 500).getTime(),
    to = addWeeks(500)(Date.now()).getTime(),
    sortBy = 'date:DESC'
  } = req.query
  const sort = generateSortFilter(sortBy)

  await MongoHelper.connect()
  const transactionsData = await MongoHelper.db
    .collection('transactions')
    .find({
      storeId: new ObjectId(user.storeId),
      dateCreated: { $gte: +from, $lte: +to },
      productId: { $exists: true }
    })
    .skip(+offset)
    .limit(+limit)
    .sort(sort)
    .toArray()

  const total = await MongoHelper.db
    .collection('transactions')
    .find({ storeId: new ObjectId(user.storeId) })
    .count()
    .catch(r => r)

  const ids = transactionsData.map(o => new ObjectId(o.productId))
  const dates = transactionsData.map(o => o.dateCreated)
  const products =
    (await MongoHelper.db
      .collection('products')
      .aggregate([{ $match: { _id: { $in: ids }, name: { $regex: searchTerm, $options: 'i' } } }])
      .toArray()
      .catch(console.log)) || []

  const data = products.map((o, idx) => ({ ...o, dateCreated: dates[idx] }))

  MongoHelper.client.close()

  res.json({ data, offset: +offset, limit: +limit, total })
})

transactions.get('/offers', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken

  const {
    offset = 0,
    limit = 25,
    searchTerm = '',
    from = subWeeks(Date.now(), 500).getTime(),
    to = addWeeks(500)(Date.now()).getTime(),
    sortBy = 'date:DESC'
  } = req.query
  const sort = generateSortFilter(sortBy)

  await MongoHelper.connect()
  const transactionsData = await MongoHelper.db
    .collection('transactions')
    .find({
      storeId: new ObjectId(user.storeId),
      dateCreated: { $gte: +from, $lte: +to },
      offerId: { $exists: true }
    })
    .skip(+offset)
    .limit(+limit)
    .sort(sort)
    .toArray()

  const total = await MongoHelper.db
    .collection('transactions')
    .find({ storeId: new ObjectId(user.storeId) })
    .count()
    .catch(r => r)

  const ids = transactionsData.map(o => new ObjectId(o.offerId))
  const dates = transactionsData.map(o => o.dateCreated)
  const offers =
    (await MongoHelper.db
      .collection('offers')
      .aggregate([{ $match: { _id: { $in: ids }, name: { $regex: searchTerm, $options: 'i' } } }])
      .toArray()
      .catch(console.log)) || []

  const data = offers.map((o, idx) => ({ ...o, dateCreated: dates[idx] }))

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
      dateCreated: new Date()
    })
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
  if (offer.storeId === user.storeId) {
    await MongoHelper.db.collection('transactions').insertOne({
      offerId: new ObjectId(offerId),
      userId: new ObjectId(userId),
      storeId: new ObjectId(user.storeId),
      dateCreated: new Date()
    })
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
