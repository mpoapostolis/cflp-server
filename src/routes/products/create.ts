import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'
import { validateToken } from '../../utils/token'

const router = Router()

const schema = Joi.object({
  product_name: Joi.string().max(128).required(),
  description: Joi.string().max(30),
  price: Joi.number().min(0).required(),
  images: Joi.string(),
  tags: Joi.array().items(Joi.string()),
})

router.post('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).json(makeErrObj(error.details))

  const { tags } = req.body
  const q1 = qb('products')
    .insert({
      ...req.body,
      store_id: req.user.store_id,
    })
    .toQuery()
  const q2 = (tag_name: string) =>
    qb('tags')
      .insert({
        tag_name,
        store_id: req.user.store_id,
      })
      .toQuery()

  try {
    await pool.query(q1)
    tags.forEach(async (tag) => await pool.query(q2(tag)).catch((e) => void 0))
    res.status(201).json({ msg: `${req.body.name} has created successfully` })
  } catch (error) {
    console.log(error)
    await pool.query('ROLLBACK')
    res.status(500).json({ msg: error })
  }
})

export default router
