import * as jwt from 'jsonwebtoken'
import * as R from 'ramda'
import { Request, Response, NextFunction } from 'express'
require('dotenv').config()

export type UserTypeToken = {
  id: string
  storeId?: string
}

export function generateToken(obj: Record<string, any>, duration: string) {
  const ids = R.pick(['id', 'store_id'], obj)
  return jwt.sign(ids, process.env['TOKEN'], { expiresIn: duration })
}

export function validateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env['TOKEN'], (err, user: UserTypeToken) => {
    if (err) return res.sendStatus(403)
    req['user'] = user
    next()
  })
}

export async function getLoginResponse(obj: Record<string, any>) {
  const infos = R.omit(['password', 'fbId'], obj)
  const token = await generateToken(obj, '1d')
  const refresh_token = await generateToken(obj, '1w')
  return {
    ...infos,
    token,
    refresh_token,
  }
}
