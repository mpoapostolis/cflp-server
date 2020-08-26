import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb, st } from '../../utils/pgHelper'
import q from './query'

const geolog = Router()

geolog.get('/geolog', validateToken, async (req: Request, res: Response) => {
  const query = qb('geo_log_events')
    .select('groups')
    .innerJoin('users', 'user_id', 'users.id')
    .whereRaw(`geo_log_events.date_created > NOW() - INTERVAL '960 hours'`)
    .toQuery()
  try {
    const countNearMe = await (await pool.query(query)).rowCount
    res.status(200).json({ countNearMe })
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: error })
  }
})

geolog.get(
  '/geolog/near',
  validateToken,
  async (req: Request, res: Response) => {
    const query = q(req.query.longitude, req.query.latitude)
    try {
      const data = await (await pool.query(query)).rows
      res.status(200).json({ data })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error })
    }
  }
)

geolog.post(
  '/geolog/:id',
  validateToken,
  async (req: Request, res: Response) => {
    const query = qb('geo_log_events')
      .insert({
        user_id: req.params.id,
        geom: st.geomFromText(
          `POINT(${req.body.longitude} ${req.body.latitude})`
        ),
      })
      .toQuery()
    try {
      await pool.query(query)
      res.status(200).json({ msg: 'ok' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error })
    }
  }
)

export default geolog
