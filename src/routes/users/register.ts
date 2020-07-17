import * as bcrypt from 'bcrypt'
import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { groupByAge } from '../../utils'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'

const router = Router()

const schema = Joi.object({
  username: Joi.string().min(5).max(30).required(),
  password: Joi.string().min(5).max(30).required(),
  birthday: Joi.date().required(),
  gender: Joi.string().valid('male', 'female').required(),
  firstName: Joi.string().min(5).max(30),
  lastName: Joi.string().min(5).max(30),
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
      username: req.body.username,
    })
    .limit(1)
    .toQuery()
  const user = await pool.query(q1)
  if (user.rowCount > 0)
    return res
      .status(409)
      .json({ msg: `user ${req.body.username} already exists` })

  bcrypt.hash(req.body.password, 10, async (err, password) => {
    if (err) return res.status(500).send(err)
    try {
      const { birthday, gender, ...rest } = req.body
      const ageGroup = groupByAge(birthday)
      const q2 = qb('users')
        .insert({
          ...rest,
          loyalty_points: JSON.stringify({}),
          password,
          groups: JSON.stringify({ ageGroup, gender }),
        })
        .toQuery()
      await pool.query(q2)

      res
        .status(201)
        .json({ msg: `user ${req.body.username} has created successfully` })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error })
    }
  })
})

export default router
