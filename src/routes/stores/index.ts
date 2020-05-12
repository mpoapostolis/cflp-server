import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'
import del from './delete'
import update from './update'
import create from './create'
import { makeErrObj } from '../../utils/error'
import * as Joi from '@hapi/joi'
import { ObjectID } from 'mongodb'

const read = Router()

read.get('/:id', validateToken, async (req: Request, res: Response) => {
  const { id = '' } = req.params

  const db = await slourpDb()
  const collection = await db.collection('stores')
  const store = await collection.findOne({ _id: new ObjectID(id) })
  if (store) res.status(200).json(store)
  else res.status(401)
})

const schema = Joi.object({
  searchTerm: Joi.string(),
  radius: Joi.number().min(100).required(), // dev purposes
  long: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  limit: Joi.number().min(5).max(25),
  skip: Joi.number().min(0),
})

read.get('/', validateToken, async (req: Request, res: Response) => {
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
  if (error) return res.status(400).json(makeErrObj(error.details))

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
