import * as bcrypt from 'bcrypt'
import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

const schema = Joi.object({
  username: Joi.string().min(5).max(30).required(),
  password: Joi.string().min(5).max(30).required(),
  firstName: Joi.string().min(5).max(30),
  lastName: Joi.string().min(5).max(30),
  avatar: Joi.string().min(5).max(30),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'gr'] } }),
  gender: Joi.string().valid('male', 'female').required(),
  age: Joi.number().integer().max(100).required(),
})

router.post('/register', async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()

  const users = db.collection('users')
  // check if user exist
  const alreadyExist = await users.findOne({ username: req.body.username })
  if (alreadyExist) return res.status(409).json({ msg: `user ${req.body.username} already exists` })
  bcrypt.hash(req.body.password, 10, async (err, password) => {
    if (err) res.status(500).send(err)
    await users.insertOne({ ...req.body, password }).catch((err) => res.status(500).send(err))
    res.status(201).json({ msg: `user ${req.body.username} has created successfully` })
  })
})

export default router
