import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import * as AWS from 'aws-sdk'
import * as multer from 'multer'
import * as multerS3 from 'multer-s3'
import * as crypto from 'crypto'

require('dotenv').config()

const s3 = new AWS.S3({
  endpoint: 'fra1.digitaloceanspaces.com',
  accessKeyId: process.env['SPACES_KEY'],
  secretAccessKey: process.env['SPACES_SECRET'],
})

const multerUpload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'slourp-photos',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      const [, type] = file.mimetype.split('/')
      cb(null, `${crypto.randomBytes(12).toString('hex')}.${type}`)
    },
  }),
})

const upload = Router()
upload.post('/upload/images', validateToken, multerUpload.array('images', 3), async (req: Request, res: Response) => {
  const files = req.files as (Express.Multer.File & { location: string })[]
  res.status(201).json({ paths: files.map((f) => f.location) })
})

export default upload
