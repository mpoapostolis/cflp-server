import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { getMongoClient } from '../../utils/mongoHelper'
import { ObjectId } from 'mongodb'
import { validateToken } from '../../utils/token'

type typeOfTransaction = 'earn' | 'payout'
const router = Router()

const schema = Joi.object({
  userId: Joi.string().alphanum().max(100).required(),
  productId: Joi.string().alphanum().max(100).required(),
})

router.post('/product/:type', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))

  const type = req.params.type as typeOfTransaction
  const factor = type === 'earn' ? 1 : -1
  const client = await getMongoClient()
  const session = client.startSession()

  try {
    await client.startSession().withTransaction(async () => {
      const { storeId } = req.user
      const products = client.db('slourp').collection('products')
      const users = client.db('slourp').collection('users')
      const transactions = client.db('slourp').collection('transactions')
      const product = await products.findOne({ _id: new ObjectId(req.body.productId) })
      const user = await users.findOne({ _id: new ObjectId(req.body.userId) })

      if (type === 'payout' && user.loyaltyPoints[storeId] < product.lpPrice) throw 'inefficient lpPoints'

      await users.updateOne(
        { _id: new ObjectId(req.body.userId) },
        {
          $inc: { [`loyaltyPoints.${storeId}`]: factor * product.lpReward },
        }
      )
      await products.updateOne(
        { _id: new ObjectId(req.body.productId) },
        {
          $inc: {
            'analytics.purchased': 1,
            [`analytics.${user.groups.gender}`]: 1,
            [`analytics.ageGroup.${user.groups.groupAge}`]: 1,
          },
        }
      )
      await transactions.insertOne({
        userId: new ObjectId(req.body.userId),
        productId: new ObjectId(req.body.productId),
        storeId: new ObjectId(storeId),
      })
    })
    res.status(200).json({ msg: 'transaction complete successfully' })
  } catch (err) {
    res.status(400).json({ msg: err })
  } finally {
    await session.endSession()
  }

  // const db = await slourpDb()

  // const users = db.collection('users')
  // // check if user exist
  // const alreadyExist = await users.findOne({ username: req.body.username })
  // if (alreadyExist) return res.status(409).json({ msg: `user ${req.body.username} already exists` })
  // bcrypt.hash(req.body.password, 10, async (err, password) => {
  //   if (err) res.status(500).send(err)
  //   await users.insertOne({ ...req.body, password }).catch((err) => res.status(500).send(err))
  //   res.status(201).json({ msg: `user ${req.body.username} has created successfully` })
  // })
})

export default router
