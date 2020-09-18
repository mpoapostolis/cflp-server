import { Router, Request, Response } from 'express'
import { uuid } from 'uuidv4'

import * as multer from 'multer'
import * as path from 'path'
import * as imagemin from 'imagemin'
import * as imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'

require('dotenv').config()

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, process.env['UPLOAD_PATH'])
  },
  filename: function (_req, file, cb) {
    cb(null, uuid() + path.extname(file.originalname)) //Appending extension
  },
})

const uploadImage = multer({ storage })

const upload = Router()
upload.post(
  '/upload/images',
  uploadImage.single('image'),
  async (req: Request, res: Response) => {
    ;(async () => {
      const ext = path.extname(req.file.originalname)
      const filters = []
      console.log(filters)

      await imagemin([req.file?.path], {
        destination: process.env['UPLOAD_PATH'],
        plugins: filters,
      })
    })()

    console.log('----')

    res.status(201).json({ path: req.file?.filename })
  }
)

export default upload
