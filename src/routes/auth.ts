import { Router, Request, Response, NextFunction } from 'express'
import { MongoHelper } from '../mongoHelper'
import { User } from '../models/users'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import * as R from 'ramda'
const auth = Router()
dotenv.config()

function generateToken(obj: Record<string, any>, duration: string, key: string) {
  return jwt.sign(obj, key, { expiresIn: duration })
}

export function validateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env['TOKEN'], (err, user) => {
    if (err) return res.sendStatus(403)
    req.authInfo = user
    console.log(user)
    next()
  })
}

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
  console.log(username, password)
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
        const client = R.omit(['password'], user)
        const infos = R.pick(['_id', 'storeId'], client)
        const token = await generateToken(infos, '2w', process.env['TOKEN'])
        const refreshToken = await generateToken(infos, '1w', process.env['RTOKEN'])
        res.status(200).json({
          ...client,
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

export default auth
