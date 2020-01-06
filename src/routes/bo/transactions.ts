import { Router, Request, Response } from 'express'
import { validateAdminToken } from '../../utils'
import { MongoHelper } from '../../mongoHelper'
import { EmployeeToken } from 'models/users'
import { ObjectId } from 'mongodb'

const transactions = Router()

transactions.get('/', validateAdminToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25, type = 'products', searchTerm = '', from, to } = req.query

  const lookUp = {
    $lookup:
      type === 'products'
        ? {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        : {
            from: 'offers',
            localField: 'offerId',
            foreignField: '_id',
            as: 'offer'
          }
  }

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('transactions')
    .aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      lookUp,
      { $match: { productId: { $exists: type === 'products' ? 1 : 0 } } },
      { $limit: +limit + +offset },
      { $skip: +offset },
      {
        $unwind: {
          path: '$offer',
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          dateCreated: 1,
          userName: '$user.username',
          productName: '$product.name',
          productPrice: '$product.price',
          productId: '$product._id',
          offerName: '$offer.name',
          offerId: '$offer._id'
        }
      }
    ])
    .toArray()
    .catch(console.log)

  const total = await MongoHelper.db
    .collection('transactions')
    .find({ productId: { $exists: type === 'products' ? 1 : 0 } })
    .count()
    .finally(() => {
      MongoHelper.client.close()
    })

  res.json({ data, offset: +offset, limit: +limit, total })
})

transactions.post('/', validateAdminToken, async (req: Request, res: Response) => {
  const user = req.user as EmployeeToken
  console.log(user)

  res.json({
    a: 1
  })
})

transactions.post('/credit', validateAdminToken, async (req: Request, res: Response) => {
  res.json({})
})

export default transactions
