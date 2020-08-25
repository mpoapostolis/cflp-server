import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb } from '../../utils/pgHelper'

const tags = Router()

tags.get('/tags', async (req: Request, res: Response) => {
  const query = qb('tags').select('tag_name', 'store_id').toQuery()
  try {
    const data = await await pool.query(query)
    res.status(200).json(data.rows)
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})

tags.get(
  '/tags-analytics',
  validateToken,
  async (req: Request, res: Response) => {
    const query = qb('tags').select('*').toQuery()
    try {
      const data = await await pool.query(query)
      res.status(200).json(data.rows)
    } catch (error) {
      res.status(500).json({ msg: error })
    }
  }
)

export default tags
