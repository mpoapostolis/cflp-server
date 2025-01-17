import * as bcrypt from 'bcrypt'
import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { groupByAge } from '../../utils'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'

const router = Router()

const schema = Joi.object({
  user_name: Joi.string().min(5).max(30).required(),
  password: Joi.string().min(5).max(30).required(),
  birthday: Joi.date().required(),
  store_id: Joi.string(),
  gender: Joi.string().valid('male', 'female').required(),
  first_name: Joi.string().min(5).max(30),
  last_name: Joi.string().min(5).max(30),
  avatar: Joi.string().min(5).max(30),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'gr'] },
  }),
})

router.post('/register', async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).json(makeErrObj(error.details))

  const q1 = qb('users')
    .where({
      user_name: req.body.user_name,
    })
    .limit(1)
    .toQuery()
  const user = await pool.query(q1)
  if (user.rowCount > 0)
    return res
      .status(409)
      .json({ msg: `user ${req.body.user_name} already exists` })

  bcrypt.hash(req.body.password, 10, async (err, password) => {
    if (err) return res.status(500).send(err)
    try {
      const q2 = qb('users')
        .insert({
          loyalty_points: 0,
          password,
          ...req.body,
        })
        .toQuery()
      await pool.query(q2)

      res
        .status(201)
        .json({ msg: `user ${req.body.user_name} has created successfully` })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error })
    }
  })
})

export default router
