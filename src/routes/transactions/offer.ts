import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { getMongoClient } from '../../utils/mongoHelper'
import { ObjectId } from 'mongodb'
import { validateToken } from '../../utils/token'

const router = Router()

const schema = Joi.object({
  userId: Joi.string().alphanum().max(100).required(),
  offerId: Joi.string().alphanum().max(100).required(),
})

router.post('/offer', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))

  const client = await getMongoClient()
  const session = client.startSession()

  try {
    await client
      .startSession()
      .withTransaction(async () => {
        const { storeId } = req.user
        const offers = client.db('slourp').collection('offers')
        const products = client.db('slourp').collection('products')
        const users = client.db('slourp').collection('users')
        const transactions = client.db('slourp').collection('transactions')
        const offer = await offers.findOne({ _id: new ObjectId(req.body.offerId) })
        const user = await users.findOne({ _id: new ObjectId(req.body.userId) })
        const productIds = offer.discounts.map((disc) => new ObjectId(disc.productId))

        await offers.updateOne(
          { _id: new ObjectId(req.body.offerId) },
          {
            $inc: {
              'analytics.purchased': 1,
              [`analytics.${user.groups.gender}`]: 1,
              [`analytics.ageGroup.${user.groups.groupAge}`]: 1,
            },
          }
        )

        await products.updateMany(
          { _id: { $in: productIds } },
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
          offerId: new ObjectId(req.body.offerId),
          storeId: new ObjectId(storeId),
        })
      })
      .catch(console.log)
    res.status(200).json({ msg: 'transaction complete successfully' })
  } catch (err) {
    res.status(400).json({ msg: err })
  } finally {
    await session.endSession()
  }
})

export default router
