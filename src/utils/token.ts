import * as jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export type UserTypeToken = {
  id: string
  storeId?: string
}

export function generateToken(obj: Record<string, any>, duration: string, key: string) {
  return jwt.sign(obj, key, { expiresIn: duration })
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
