import * as jwt from 'jsonwebtoken'
import { NextFunction, Response, Request } from 'express'
import { EmployeeToken } from 'models/users'
import * as multer from 'multer'
import * as mkdirp from 'mkdirp'
import * as crypto from 'crypto'
import * as sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'
import * as R from 'ramda'

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
    next()
  })
}

export function generateSortFilter(sortBy: string) {
  const [key, dir] = sortBy.split(':')
  const direction = dir === 'ASC' ? 1 : -1
  const k = key === 'date' ? '_id' : key
  return { [k]: direction }
}

const storage = multer.diskStorage({
  destination: function(_req, _file, cb) {
    mkdirp.sync(process.env['UPLOAD_PATH'])
    cb(null, process.env['UPLOAD_PATH'])
  },
  filename: function(_req, file, cb) {
    const [, type] = file.mimetype.split('/')
    cb(null, `${crypto.randomBytes(18).toString('hex')}.${type}`)
  }
})

export const uploadImg = multer({ storage }).array('image')

export function resizeImage(req: Request) {
  const files: any[] = R.propOr([], 'files', req)
  files.forEach(async o => {
    await fs.unlinkSync(req.file.path)
    await sharp(o.path)
      .resize(500)
      .jpeg({ quality: 50 })
      .toFile(path.resolve(o.destination, 'resized', o.filename))
  })
}
