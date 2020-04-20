import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'

const router = Router()
export enum offerStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

const schema = Joi.object({
  id: Joi.string().max(30).required(),
  name: Joi.string().min(5).max(30),
  description: Joi.string().min(5).max(240),
  coords: Joi.array().items(Joi.number().min(-180).max(180)).length(2),
  images: Joi.string().max(30),
  price: Joi.number(),
  lpPrice: Joi.number().min(0),
  status: Joi.string().valid(offerStatus.ONLINE, offerStatus.OFFLINE),
  discounts: Joi.array().items(
    Joi.object().keys({
      id: Joi.string().required(),
      dicsount: Joi.number().max(1).min(0).required(),
    })
  ),
})

router.patch('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const { storeId } = req.body
  const { id, ...rest } = req.body
  const db = await slourpDb()

  await db
    .collection('offers')
    .updateOne({ _id: new ObjectID(id), storeId: new ObjectID(storeId) }, { $set: rest })
    .catch((err) => res.status(500).send(err))

  res.status(200).json({ msg: `offer has updated successfully` })
})

export default router
