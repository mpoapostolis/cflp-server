import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

const schema = Joi.object({
  name: Joi.string().max(30).required(),
  coords: Joi.array().items(Joi.number().min(-180).max(180)).length(2).required(),
  images: Joi.array(),
  description: Joi.string().max(150),
  adress: Joi.string().max(150),
})

router.post('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()

  const collection = await db.collection('stores')
  await collection.insertOne(req.body).catch((err) => res.status(500).send(err))
  res.status(201).json({ msg: `store ${req.body.name} has created successfully` })
})

export default router
