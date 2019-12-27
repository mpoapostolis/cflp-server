import { Router, Request, Response, NextFunction } from 'express'
import { MongoHelper } from '../mongoHelper'
import { User } from '../models/users'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
const auth = Router()
dotenv.config()

function generateToken(_id: string, duration: string, key: string) {
  return jwt.sign({ _id }, key, { expiresIn: duration })
}

export function validateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env['TOKEN'], (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    console.log(user)
    next()
  })
}

auth.post('/register', (req: Request, res: Response) => {
  const { username = '', password = '' } = req.body
  const { storeId = '' } = req.query
  bcrypt.hash(password, 10, async (err, hash) => {
    await MongoHelper.connect()
    const collection = await MongoHelper.db.collection('users')

    collection
      .insertOne({
        username,
        password: hash
      })
      .catch(_ => res.sendStatus(500))
      .finally(() => {
        MongoHelper.client.close()
      })
    res.sendStatus(200)
  })
})

auth.post('/login', async (req: Request, res: Response) => {
  const { username = '', password = '' } = req.body
  await MongoHelper.connect()

  const user: User = await MongoHelper.db.collection('users').findOne({ username })

  if (user) {
    await bcrypt.compare(password, user.password)
    delete user.password
    const { _id } = user
    const token = await generateToken(_id, '2w', process.env['TOKEN'])
    const refreshToken = await generateToken(_id, '1w', process.env['RTOKEN'])
    res.json({
      ...user,
      token,
      refreshToken
    })
  } else {
    res.status(401).json({
      msg: 'bad credentials'
    })
  }
  MongoHelper.client.close()
})

export default auth
