import * as bcrypt from 'bcrypt'
import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import slourpDb from '../../utils/mongoHelper'

type typeOfTransaction = 'earn' | 'payout'
const router = Router()

const schema = Joi.object({
  userId: Joi.string().alphanum().max(100).required(),
  productId: Joi.string().alphanum().max(100).required(),
})

router.post('/product/:type', async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))
  const db = await slourpDb()

  res.status(200).json(req.params)
  // const db = await slourpDb()

  // const users = db.collection('users')
  // // check if user exist
  // const alreadyExist = await users.findOne({ username: req.body.username })
  // if (alreadyExist) return res.status(409).json({ msg: `user ${req.body.username} already exists` })
  // bcrypt.hash(req.body.password, 10, async (err, password) => {
  //   if (err) res.status(500).send(err)
  //   await users.insertOne({ ...req.body, password }).catch((err) => res.status(500).send(err))
  //   res.status(201).json({ msg: `user ${req.body.username} has created successfully` })
  // })
})

export default router
