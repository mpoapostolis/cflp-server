import { Router, Request, Response } from 'express'
import { MongoHelper } from '../mongoHelper'
import { User } from '../models/users'
import * as bcrypt from 'bcrypt'
import * as R from 'ramda'
import * as jwt from 'jsonwebtoken'
import { generateToken } from '../utils'
import { ObjectID } from 'mongodb'

const auth = Router()

const getEmployeeData = (data: User) =>
  R.pick(
    [
      '_id',
      'firstName',
      'lastName',
      'avatar',
      'email',
      'gender',
      'age',
      'favorites',
      'username',
      'permissions',
      'storeId'
    ],
    data
  )

const getClientData = (data: User) =>
  R.pick(
    ['_id', 'firstName', 'lastName', 'avatar', 'email', 'gender', 'age', 'loyaltyPoints', 'favorites', 'username'],
    data
  )

auth.post('/register', (req: Request, res: Response) => {
  bcrypt.hash(req.body.password, 10, async (err, hash) => {
    await MongoHelper.connect()
    const collection = await MongoHelper.db.collection('users')
    const infos = R.pick(['username', 'password', 'storeId'], req.body)
    collection
      .insertOne({ ...infos, password: hash })
      .catch(_ => res.sendStatus(500))
      .finally(() => {
        MongoHelper.client.close()
      })
    res.sendStatus(200)
  })
})

auth.post('/login', async (req: Request, res: Response) => {
  const { username = '', password = '', origin = 'app' } = req.body
  await MongoHelper.connect()
  const user: User = await MongoHelper.db.collection('users').findOne({ username })
  if (!user) {
    res.status(404).json({
      error: {
        username: 'User not found'
      }
    })
  } else {
    await bcrypt.compare(password, user.password, async (err, same) => {
      if (same) {
        if (origin === 'admin' && !user.storeId)
          return res.status(403).json({
            error: {
              username: 'user does not belont to any store'
            }
          })
        const infos = R.pick(['_id', 'storeId'], user)
        const token = await generateToken(infos, '15m', process.env['TOKEN'])
        const refreshToken = await generateToken(infos, '1w', process.env['TOKEN'])
        const usesInfos = origin === 'admin' ? getEmployeeData(user) : getClientData(user)
        res.status(200).json({
          ...usesInfos,
          token,
          refreshToken
        })
      } else {
        res.status(404).json({
          error: {
            password: 'Bad Credentials'
          }
        })
      }
    })
  }
  MongoHelper.client.close()
})

auth.post('/refresh-token', (req: Request, res: Response) => {
  const { refreshToken } = req.body

  jwt.verify(refreshToken, process.env['TOKEN'], async (err, infos) => {
    if (err) return res.status(403).json({ error: 'invalid  refresh token' })

    const refreshToken = await generateToken(R.pick(['_id', 'storeId'], infos), '1w', process.env['TOKEN'])
    const token = await generateToken(R.pick(['_id', 'storeId'], infos), '15m', process.env['TOKEN'])

    res.json({
      token,
      refreshToken
    })
  })
})

export default auth
