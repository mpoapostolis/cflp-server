import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb, st } from '../../utils/pgHelper'
import q from './query'

const geolog = Router()

geolog.get('/geolog', validateToken, async (req: Request, res: Response) => {
  try {
    const [myStore] = await (
      await pool.query(qb('stores').where({ id: req.user.store_id }).toQuery())
    ).rows

    const query = qb('geo_log_events')
      .where(
        st.dwithin(
          'geom',
          st.geography(st.makePoint(myStore.coords.x, myStore.coords.y)),
          15000
        )
      )

      .andWhereRaw(
        `
        geo_log_events.date_created > NOW() - INTERVAL '180 seconds'`
      )
      .toQuery()
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
    try {
      const [myStore] = await (
        await pool.query(
          qb('stores').where({ id: req.user.store_id }).toQuery()
        )
      ).rows
      const query = q(23.6751655, 37.9945978)
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
    try {
      const q1 = await qb('geo_log_events')
        .where({ user_id: req.params.id })
        .andWhereRaw(
          `geo_log_events.date_created > NOW() - INTERVAL '180 seconds'`
        )
        .toQuery()
      const found = await (await pool.query(q1)).rowCount
      if (found > 0) return res.status(200).json({ msg: 'already updated' })

      const query = qb('geo_log_events')
        .insert({
          user_id: req.params.id,
          geom: st.geomFromText(
            `POINT(${req.body.longitude} ${req.body.latitude})`
          ),
        })
        .toQuery()
      await pool.query(query)
      res.status(200).json({ msg: 'ok' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error })
    }
  }
)

export default geolog
