import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { validateToken } from '../../utils/token'
import { Request, Response, Router } from 'express'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

const schema = Joi.object({
  id: Joi.string().alphanum().max(128).required(),
})

router.delete('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()

  const found = await db.collection('stores').deleteOne({ _id: new ObjectID(req.body.id) })
  if (found.deletedCount > 0) return res.status(201).json({ msg: `store has deleted successfully` })
  else return res.status(401).json({ msg: `id ${req.body.id} does not exist` })
})
export default router
