import { Request, Response, Router } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb } from '../../utils/pgHelper'

const router = Router()

router.delete('/:id', validateToken, async (req: Request, res: Response) => {
  try {
    const query = qb('stores')
      .where({
        id: req.params.id,
      })
      .delete()
      .toQuery()

    await pool.query(query)
    res.status(201).json({ msg: `store has deleted successfully` })
  } catch (error) {
    res.status(400).json({ msg: `wrong id` })
  }
})
export default router
