import { Router } from 'express'
import login from './login'
import register from './register'
import facebook from './facebook'
import favorites from './favorites'
import { validateToken } from '../../utils/token'
import pool, { qb } from '../../utils/pgHelper'

const users = Router()
users.use('/users', register, favorites, login, facebook)

users.get('/users/get-slourps', validateToken, async (req, res) => {
  const q1 = qb('users')
    .select('loyalty_points')
    .where({ id: req.user.id })
    .toQuery()
  const lp = await (await pool.query(q1)).rows[0]
  res.json(lp)
})

export default users
