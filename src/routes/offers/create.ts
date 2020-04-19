import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { Request, Response, Router } from 'express'
import { itemAnalytics } from '../../utils/'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

export enum offerStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

const schema = Joi.object({
  name: Joi.string().min(5).max(30).required(),
  description: Joi.string().min(5).max(240).required(),
  coords: Joi.array().items(Joi.number().min(-180).max(180)).length(2).required(),
  images: Joi.string().max(30),
  price: Joi.number(),
  lpPrice: Joi.number().min(0),
  status: Joi.string().valid(offerStatus.ONLINE, offerStatus.OFFLINE),
  discounts: Joi.array().items(
    Joi.object().keys({
      id: Joi.string(),
      dicsount: Joi.number().max(1).min(0),
    })
  ),
})

router.post('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()
  await db
    .collection('offers')
    .insertOne({ ...req.body, storeId: new ObjectID(req.user.storeId), analytics: itemAnalytics })
    .catch((err) => res.status(500).send(err))
  res.status(201).json({ msg: `${req.body.name} has created successfully` })
})

export default router
