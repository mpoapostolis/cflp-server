import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { Router, Request, Response } from 'express'
import { itemAnalytics } from '../../utils'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

const schema = Joi.object({
  name: Joi.string().max(30).required(),
  description: Joi.string().max(30).required(),
  price: Joi.number().min(0).required(),
  lpPrice: Joi.number().min(0),
  lpReward: Joi.number().min(0),
  images: Joi.array().items(Joi.string()),
})

router.post('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()
  await db
    .collection('products')
    .insertOne({ ...req.body, storeId: new ObjectID(req.user.storeId), analytics: itemAnalytics })
    .catch((err) => res.status(500).send(err))
  res.status(201).json({ msg: `${req.body.name} has created successfully` })
})

export default router
