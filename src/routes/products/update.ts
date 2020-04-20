import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

const schema = Joi.object({
  id: Joi.string().alphanum().required(),
  name: Joi.string().max(30),
  description: Joi.string().max(30),
  price: Joi.number().min(0),
  lpPrice: Joi.number().min(0),
  lpReward: Joi.number().min(0),
  images: Joi.array().items(Joi.string()),
})

router.patch('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const { id, ...rest } = req.body
  const db = await slourpDb()
  await db
    .collection('products')
    .updateOne({ _id: new ObjectID(id) }, { $set: rest })
    .catch((err) => res.status(500).send(err))

  res.status(200).json({ msg: `product has updated successfully` })
})

export default router
