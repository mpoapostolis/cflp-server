import * as Joi from '@hapi/joi'
import { validateToken } from '../../utils/token'
import { Request, Response, Router } from 'express'
import { makeErrObj } from '../../utils/error'
import pool, { qb, st } from '../../utils/pgHelper'

const router = Router()

const schema = Joi.object({
  name: Joi.string().max(30).required(),
  long: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  image: Joi.array(),
  description: Joi.string().max(150),
  address: Joi.string().max(150).required(),
})

router.patch('/:id', validateToken, async (req: Request, res: Response) => {
  const error = schema.validate(req.body).error
  if (error) return res.status(400).json(makeErrObj(error.details))

  try {
    const query = qb('stores')
      .where({
        id: req.params.id,
      })
      .update({
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

    await pool.query(query)
    res.status(201).json({
      msg: `store ${req.body.name} updated successfully`,
    })
  } catch (error) {
    res.status(400).json({ msg: error })
  }
})
export default router
