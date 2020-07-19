import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb } from '../../utils/pgHelper'
import { makeErrObj } from '../../utils/error'

const router = Router()

const schema = Joi.object({
  id: Joi.string().alphanum().max(128).required(),
})

router.delete('/', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).json(makeErrObj(error.details))
  const query = qb('products')
    .where({
      id: req.params.id,
    })
    .delete()
    .toQuery()
  try {
    await pool.query(query)
    return res.status(201).json({ msg: `product has deleted successfully` })
  } catch (error) {
    res.status(400).json({ msg: error })
  }
})

export default router
