import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { Router, Request, Response } from 'express'
import slourpDb from '../../utils/mongoHelper'
import { validateToken } from '../../utils/token'

const router = Router()

const schema = Joi.object({
  id: Joi.string().alphanum().max(128).required(),
})

router.delete('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()

  const found = await db
    .collection('products')
    .deleteOne({ _id: new ObjectID(req.body.id), storeId: new ObjectID(req.body.storeId) })
  if (found.deletedCount > 0) return res.status(201).json({ msg: `product has deleted successfully` })
  else return res.status(401).json({ msg: `id ${req.body.id} does not exist` })
})

export default router
