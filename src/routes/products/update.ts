import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'

const router = Router()

const schema = Joi.object({
  product_name: Joi.string().max(30),
  description: Joi.string().max(30),
  price: Joi.number().min(0),
  lp_price: Joi.number().min(0),
  lp_reward: Joi.number().min(0),
  images: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
})

router.patch('/:id', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).json(makeErrObj(error.details))

  const { id, tags, ...rest } = req.body

  const q1 = qb('products')
    .where({ id: req.params.id })
    .update({ ...rest, tags })
    .toQuery()

  const q2 = (tag_name: string) =>
    qb('tags')
      .insert({
        tag_name,
      })
      .toQuery()

  try {
    await pool.query(q1)
    tags.forEach(async (tag) => await pool.query(q2(tag)).catch((e) => void 0))
    return res.status(200).json({ msg: `product has updated successfully` })
  } catch (error) {
    return res.status(400).json({ msg: error })
  }
})

export default router
