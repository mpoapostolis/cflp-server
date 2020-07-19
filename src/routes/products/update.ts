import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'

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
  if (error) return res.status(400).json(makeErrObj(error.details))
  const query = qb('products')
    .where({ id: req.body.id })
    .update(req.body)
    .toQuery()
  try {
    await pool.query(query)
    return res.status(200).json({ msg: `product has updated successfully` })
  } catch (error) {
    return res.status(400).json({ msg: error })
  }
})

export default router
