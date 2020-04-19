import * as bcrypt from 'bcrypt'
import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  storeId: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  lastName: Joi.string().alphanum().min(3).max(30).required(),
  age: Joi.number().integer().max(100).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'gr'] } })
    .required(),
})

router.post('/register', async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()

  const employees = db.collection('employees')
  // check if user exist
  const alreadyExist = await employees.findOne({ username: req.body.username })
  if (alreadyExist) return res.status(409).json({ msg: `user ${req.body.username} already exists` })
  bcrypt.hash(req.body.password, 10, async (err, password) => {
    if (err) res.status(500).send(err)
    await employees.insertOne({ ...req.body, password }).catch((err) => res.status(500).send(err))
    res.status(201).json({ msg: `user ${req.body.username} has created successfully` })
  })
})

export default router
