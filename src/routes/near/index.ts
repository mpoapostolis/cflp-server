import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'
import * as Joi from '@hapi/joi'

const schemaRegister = Joi.object({
  coords: Joi.array().items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90)).length(2).required(),
  gender: Joi.string().valid('male', 'female').required(),
  groupAge: Joi.string().valid('16-17', '18-24', '25-34', '35-44', '45-55', '56+').required(),
})

const near = Router()

near.post('/near', validateToken, async (req: Request, res: Response) => {
  const error = schemaRegister.validate(req.body).error
  if (error) return res.status(400).send(error.details.map((obj) => obj.message))

  const db = await slourpDb()
  const collection = await db.collection('near')
  await collection.insertOne({
    gender: req.body.gender,
    groupAge: req.body.groupAge,
    location: { type: 'Point', coordinates: req.body.coords },
  })
  res.status(200).send('ok')
})

const schemaGet = Joi.object({
  radius: Joi.number().min(100).max(5000).required(),
  long: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  limit: Joi.number().min(5).max(25),
  skip: Joi.number().min(0),
})

near.get('/near', validateToken, async (req: Request, res: Response) => {
  const lat = +req.query.lat
  const long = +req.query.long
  const radius = +req.query.radius
  const limit = +req.query.limit || 10
  const skip = +req.query.skip || 0
  schemaGet.validate({ lat, long, radius, skip, limit })
  const db = await slourpDb()
  const collection = await db.collection('near')
  const near = await collection.find(
    {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [long, lat] },
          $maxDistance: radius,
        },
      },
    },
    { projection: { location: 0, _id: 0 } }
  )

  const total = await near.count()
  const data = await near
    .skip(+skip)
    .limit(+limit)
    .toArray()

  res.status(200).json({ data, total })
})

export default near
