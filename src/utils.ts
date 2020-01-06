import * as jwt from 'jsonwebtoken'
import { NextFunction, Response, Request } from 'express'
import { EmployeeToken } from 'models/users'

export function generateToken(obj: Record<string, any>, duration: string, key: string) {
  return jwt.sign(obj, key, { expiresIn: duration })
}

export function validateAdminToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env['TOKEN'], (err, user: EmployeeToken) => {
    if (err || !user.storeId) return res.sendStatus(403)
    req.user = user
    next()
  })
}

export function validateClientToken(req: Request, res: Response, next: NextFunction) {
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

export function generateSortFilter(sortBy: string) {
  const [key, dir] = sortBy.split(':')
  const direction = dir === 'ASC' ? 1 : -1
  const k = key === 'date' ? '_id' : key
  return { [k]: direction }
}
