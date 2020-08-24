import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { st, qb } from '../../utils/pgHelper'
import { makeErrObj } from '../../utils/error'

const router = Router()

const schema = Joi.object({
  name: Joi.string().max(30).required(),
  long: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  image: Joi.array(),
  description: Joi.string().max(150),
  address: Joi.string().max(150).required(),
})

router.post('/', async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).json(makeErrObj(error.details))

  const query = qb
    .insert({
      name: req.body.name,
      geom: st.geomFromText(`POINT(${req.body.long} ${req.body.lat})`),
      coords: `(${req.body.long}, ${req.body.lat})`,
      image: req.body.image,
      description: req.body.description,
      address: req.body.address,
      rating: req.body.rating,
    })
    .into('stores')
    .toQuery()

  console.log(query)
  await pool.query(query)
  res.status(201).json({
    msg: `store ${req.body.name} has created successfully`,
  })
})

export default router
