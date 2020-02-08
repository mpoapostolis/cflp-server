import { Router, Request, Response } from 'express'
import { validateAdminToken, generateSortFilter } from '../../util/utils'
import { EmployeeToken } from 'database/models/users'
import { MongoHelper } from '../../config/mongoHelper'
import { ObjectID } from 'bson'
const users = Router()

users.get('/', validateAdminToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25, searchTerm = '', sortBy = 'date:DESC' } = req.query

  const sort = generateSortFilter(sortBy)

  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('users')
    .find({
      storeId: user.storeId,
      username: { $regex: searchTerm, $options: 'i' }
    })
    .sort(sort)
    .skip(+offset)
    .limit(+limit)
    .toArray()
    .catch(console.log)

  const total = await MongoHelper.db
    .collection('users')
    .find({ storeId: user.storeId })
    .count()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.send({ data, offset: +offset, limit: +limit, total })
})

users.get('/:id', validateAdminToken, async (req: Request, res: Response) => {
  const params = req.params
  await MongoHelper.connect()
  const product = await MongoHelper.db.collection('users').findOne({ _id: new ObjectID(params.id) })
  MongoHelper.client.close()
  res.json(product)
})

export default users
