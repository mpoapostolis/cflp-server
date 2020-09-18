import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb } from '../../utils/pgHelper'

const router = Router()

router.delete('/:id', validateToken, async (req: Request, res: Response) => {
  const query = qb('products')
    .where({
      id: req.params.id,
    })
    .delete()
    .toQuery()
  try {
    await pool.query(query)
    return res.status(204).json({ msg: `product has deleted successfully` })
  } catch (error) {
    res.status(400).json({ msg: error })
  }
})

export default router
