import * as bcrypt from 'bcrypt'
import { Router, Request, Response } from 'express'
import { getLoginResponse } from '../../utils/token'
import pool, { qb } from '../../utils/pgHelper'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  try {
    const q1 = qb('users')
      .where({
        user_name: req.body.user_name,
      })
      .limit(1)
      .toQuery()
    const _user = await pool.query(q1)

    if (_user.rowCount < 1)
      return res.status(401).json({ msg: 'Username or password is incorrect' })

    const user = _user.rows[0]
    await bcrypt.compare(
      req.body.password,
      user.password,
      async (err, same) => {
        if (err) return res.status(500).json({ msg: err })
        if (same) {
          const response = await getLoginResponse(user)
          return res.status(200).json(response)
        } else
          return res
            .status(401)
            .json({ msg: 'Username or password is incorrect' })
      }
    )
  } catch (error) {
    res.json({ msg: error })
  }
  // const db = await slourpDb()
})

export default router
