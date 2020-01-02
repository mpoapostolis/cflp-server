import { Router, Request, Response } from 'express'
import { validateToken } from '../auth'
import { EmployeeToken } from 'models/users'
import { MongoHelper } from '../../mongoHelper'

const products = Router()

products.get('/products', validateToken, async (req: Request, res: Response) => {
  const { offset = 0, limit = 25 } = req.query
  const user = req.user as EmployeeToken

  await MongoHelper.connect()
  const data = await MongoHelper.db
    .collection('products')
    .find({ storesId: user.storeId })
    .skip(+offset)
    .limit(+limit)
    .toArray()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.send({ data })
})

products.get('/products/:id', validateToken, async (req: Request, res: Response) => {
  const params = req.params
  await MongoHelper.connect()
  const data = await MongoHelper.db.collection('products').find({ _id: params.id })

  MongoHelper.client.close()
  res.send({ data })
  res.json({})
})

products.post('/products', async (req: Request, res: Response) => {
  res.json({})
})

products.put('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

products.delete('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

export default products
