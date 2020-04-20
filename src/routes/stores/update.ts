import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { validateToken } from '../../utils/token'
import { Request, Response, Router } from 'express'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

const schema = Joi.object({
  id: Joi.string().alphanum().required(),
  name: Joi.string().max(30),
  coords: Joi.array().items(Joi.number().min(-180).max(180)).length(2),
  images: Joi.array(),
  description: Joi.string().max(150),
  adress: Joi.string().max(150),
})

router.patch('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const { storeId } = req.body

  const { id, ...rest } = req.body
  const db = await slourpDb()

  await db
    .collection('stores')
    .updateOne({ _id: new ObjectID(id), storeId: new ObjectID(storeId) }, { $set: rest })
    .catch((err) => res.status(500).send(err))

  res.status(201).json({ msg: `store ${req.body.name} has updated successfully` })
})
export default router
