import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'
import { validateToken } from '../../utils/token'

const router = Router()

const schema = Joi.object({})

// router.post('/orders', validateToken, async (req: Request, res: Response) => {
router.post('/orders', async (req: Request, res: Response) => {
  //   const error = schema.validate(req.body).error
  //   if (error) return res.status(400).json(makeErrObj(error.details))

  const client = await pool.connect()

  const q1 = qb('products')
    .select()
    .where({ id: req.body.product_id })
    .toQuery()

  const q2 = qb('users').select().where({ id: req.body.user_id }).toQuery()

  try {
    await client.query('BEGIN')
    const product = (await client.query(q1)).rows[0]
    const user = (await client.query(q2)).rows[0]

    const q4 = qb('products')
      .update({
        analytics: JSON.stringify({
          purchased: product.analytics.purchased + 1,
          [user?.groups?.gender]:
            product.analytics[user?.groups?.gender] + 1 ?? 1,
          ageGroup: {
            [user.groups.ageGroup]:
              product.analytics.ageGroup[user?.groups?.ageGroup] + 1 || 1,
          },
        }),
      })
      .toQuery()

    await client.query(q4)

    const q5 = qb('users')
      .update({
        loyalty_points: user.loyalty_points + product.price * 90 ?? 1,
      })
      .where({
        id: req.body.user_id,
      })
      .toQuery()

    await client.query(q5)

    await client.query('COMMIT')
    res.status(200).json({ msg: 'we are cool' })
  } catch (e) {
    console.log(e)
    await client.query('ROLLBACK')
    res.status(500).json({ msg: e })
  } finally {
    client.release()
  }
})

export default router
