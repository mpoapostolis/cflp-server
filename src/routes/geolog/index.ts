import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb, st } from '../../utils/pgHelper'
import q from './query'

const geolog = Router()

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
    const q1 = qb('geo_log_events')
      .select('*')
      .whereRaw(`date_created > NOW() - INTERVAL '30 hours'`)
      .toQuery()

    console.log(req.body)

    const query = qb('geo_log_events')
      .insert({
        user_id: req.params.id,
        geom: st.geomFromText(
          `POINT(${req.body.longitude} ${req.body.latitude})`
        ),
      })
      .toQuery()
    try {
      const found = await pool.query(q1)
      // if (found.rowCount > 0) return res.status(200).json({ msg: 'ok' })
      await pool.query(query)
      res.status(200).json({ msg: 'ok' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error })
    }
  }
)

export default geolog
