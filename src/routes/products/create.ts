import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'

const router = Router()

const schema = Joi.object({
  name: Joi.string().max(30).required(),
  description: Joi.string().max(30).required(),
  price: Joi.number().min(0).required(),
  lpPrice: Joi.number().min(0),
  lpReward: Joi.number().min(0),
  images: Joi.array().items(Joi.string()),
})

router.post('/', async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).json(makeErrObj(error.details))

  const query = qb('products').insert(req.body).toQuery()

  try {
    await pool.query(query)
    res.status(201).json({ msg: `${req.body.name} has created successfully` })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})

export default router
