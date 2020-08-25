import { Router } from 'express'
import users from './users'
import stores from './stores'
import products from './products'
import upload from './uploads'
import tags from './tags'
import orders from './orders'
import geolog from './geolog'
import pool, { qb, st } from '../utils/pgHelper'

const router = Router()
router.use('/api', users, orders, geolog, stores, tags, products, upload)

router.get('/api/generate-traffic', async (req, res) => {
  const q1 = qb('users').select('id').toQuery()
  const _ids = await (await pool.query(q1)).rows
  console.log(_ids)
  const q2 = qb('geo_log_events')
    .insert(
      _ids.map((o) => ({
        user_id: o.id,
        geom: st.geomFromText(`POINT(${req.query.lng} ${req.query.lat})`),
      }))
    )
    .toQuery()
  await pool.query(q2)
  res.sendStatus(200)
})

export default router
