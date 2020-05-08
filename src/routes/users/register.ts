import * as bcrypt from 'bcrypt'
import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import slourpDb from '../../utils/mongoHelper'
import { groupByAge } from '../../utils'
import { makeErrObj } from '../../utils/error'

const router = Router()

const schema = Joi.object({
  username: Joi.string().min(5).max(30).required(),
  password: Joi.string().min(5).max(30).required(),
  birthday: Joi.date().required(),
  gender: Joi.string().valid('male', 'female').required(),
  firstName: Joi.string().min(5).max(30),
  lastName: Joi.string().min(5).max(30),
  avatar: Joi.string().min(5).max(30),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'gr'] } }),
})

router.post('/register', async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error

  if (error) return res.status(400).json(makeErrObj(error.details))
  const db = await slourpDb()

  const users = db.collection('users')
  // check if user exist
  const alreadyExist = await users.findOne({ username: req.body.username })

  if (alreadyExist) return res.status(409).json({ msg: `user ${req.body.username} already exists` })

  bcrypt.hash(req.body.password, 10, async (err, password) => {
    if (err) return res.status(401).send(err)

    const ageGroup = groupByAge(req.body.birthday)
    await users
      .insertOne({ ...req.body, loyaltyPoints: {}, password, groups: { ageGroup, gender: req.body.gender } })
      .catch((err) => res.status(500).send(err))
    res.status(201).json({ msg: `user ${req.body.username} has created successfully` })
  })
})

export default router
