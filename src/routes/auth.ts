import { Router, Request, Response, NextFunction } from 'express'
import { MongoHelper } from '../mongoHelper'
import { User } from '../models/users'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import * as R from 'ramda'
import { Employee } from 'models/employees'
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
    req.user = user
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
  const { username = '', password = '' } = req.body
  await MongoHelper.connect()
  const user: User | Employee = await MongoHelper.db.collection('users').findOne({ username })
  if (user) {
    await bcrypt.compare(password, user.password)
    delete user.password
    const infos = R.pick(['_id', 'storeId'], user)
    const token = await generateToken(infos, '2w', process.env['TOKEN'])
    const refreshToken = await generateToken(infos, '1w', process.env['RTOKEN'])
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
