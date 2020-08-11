import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import del from './delete'
import update from './update'
import create from './create'
import { makeErrObj } from '../../utils/error'
import * as Joi from '@hapi/joi'
import pool, { qb, st } from '../../utils/pgHelper'

const read = Router()

read.get('/client', async (req: Request, res: Response) => {
  const { storeSearchTerm = '', limit = 10, offset = 0 } = req.query

  const query = qb('stores')
    .select('id', 'name')
    .where('name', 'ilike', `${storeSearchTerm}%`)
    .limit(+limit)
    .offset(+offset)
    .toQuery()

  try {
    const data = await await pool.query(query)
    res.status(200).json({ data: data.rows, total: data.rowCount })
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: error })
  }
})

read.get('/:id', validateToken, async (req: Request, res: Response) => {
  const { id = '' } = req.params
  try {
    const query = qb('stores')
      .where({
        id,
      })
      .toQuery()
    const store = pool.query(query)
    res.status(200).json(store)
  } catch (error) {
    res.status(401)
  }
})

const schema = Joi.object({
  searchTerm: Joi.string(),
  radius: Joi.number().min(100).required(), // dev purposes
  long: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  limit: Joi.number().min(5),
  offset: Joi.number().min(0),
})

read.get('/', async (req: Request, res: Response) => {
  const lat = +req.query.lat
  const long = +req.query.long
  const radius = +req.query.radius
  const limit = +req.query.limit
  const offset = +req.query.offset || 0
  const searchTerm = req.query.searchTerm
  const error = schema.validate({
    lat,
    long,
    radius,
    limit,
    offset,
    searchTerm,
  }).error
  if (error) return res.status(400).json(makeErrObj(error.details))

  const query = await qb
    .select('name', 'coords', 'image', 'description', 'address', 'rating')
    .where(st.dwithin('geom', st.geography(st.makePoint(long, lat)), radius))
    .limit(limit)
    .offset(offset)
    .into('stores')
    .toQuery()

  const data = await pool.query(query)

  res.status(200).json({ data: data.rows, total: data.rowCount })
})

const stores = Router()

stores.use('/stores', create, read, update, del)

export default stores
