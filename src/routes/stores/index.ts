import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'
import del from './delete'
import update from './update'
import create from './create'
import * as Joi from '@hapi/joi'

const schema = Joi.object({
  searchTerm: Joi.string(),
  radius: Joi.number().min(100).max(5000).required(),
  long: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  limit: Joi.number().min(5).max(25),
  skip: Joi.number().min(0),
})

const read = Router()

// read.get('/', validateToken, async (req: Request, res: Response) => {
read.get('/', async (req: Request, res: Response) => {
  const lat = +req.query.lat
  const long = +req.query.long
  const radius = +req.query.radius
  const limit = +req.query.limit || 10
  const skip = +req.query.skip || 0
  const searchTerm = req.query.searchTerm
  const error = schema.validate({
    lat,
    long,
    radius,
    limit,
    skip,
    searchTerm,
  }).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))

  const db = await slourpDb()
  const collection = await db.collection('stores')
  const stores = await collection.find(
    {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lat, long] },
          $maxDistance: radius,
        },
      },
    },
    { projection: { location: 0 } }
  )
  const total = await stores.count()
  const data = await stores
    .skip(+skip)
    .limit(+limit)
    .toArray()
  res.status(200).json({ data, total })
})

const stores = Router()

stores.use('/stores', create, read, update, del)

export default stores
