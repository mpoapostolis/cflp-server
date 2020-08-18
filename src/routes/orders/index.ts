import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { makeErrObj } from '../../utils/error'
import pool, { qb } from '../../utils/pgHelper'
import { validateToken, UserTypeToken } from '../../utils/token'
import { v4 as uuidv4 } from 'uuid'

import * as jwt from 'jsonwebtoken'
import { composeP } from 'ramda'

const router = Router()

router.post('/orders', async (req: Request, res: Response) => {})

let clients = {}

function eventsHandler(req, res) {
  const token = req.query.token
  jwt.verify(token, process.env['TOKEN'], (err, user: UserTypeToken) => {
    if (err) return res.sendStatus(403)
  })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')

  // only if you want anyone to access this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*')

  res.flushHeaders()

  const clientId = req.params.id

  clients[clientId] = res

  req.on('close', () => {
    console.log(`${clientId} Connection closed`)
    delete clients[clientId]
  })
}

router.get('/listen-orders/:id', eventsHandler)

router.post('/place-order/:id', validateToken, async (req: Request, res) => {
  try {
    const order_id = uuidv4()
    const q1 = qb('orders')
      .insert(
        req.body.map((product_id) => ({
          product_id,
          user_id: req.user.id,
          store_id: req.params.id,
          order_id,
          status: 'pending',
        }))
      )
      .toQuery()

    await (await pool.query(q1)).rows

    clients[req.params.id].write(`data: new notification \n\n`)

    res.sendStatus(200)
  } catch (error) {
    console.log(error)
  }
})

router.get('/orders', validateToken, async (req: Request, res: Response) => {
  const whereObject = {
    'orders.store_id': req.user.store_id,
  }

  if (req.query.status) whereObject['status'] = req.query.status
  const q1 = qb('orders')
    .select('order_id', 'orders.date_created', 'users.user_name', 'status')
    .innerJoin('users', 'user_id', 'users.id')
    .where(whereObject)
    .groupBy('order_id', 'users.user_name', 'orders.date_created', 'status')
    .orderBy('orders.date_created', 'desc')
    .offset(Number(req.query.offset) || 0)
    .limit(Number(req.query.offset) || 10)
    .toQuery()

  try {
    const data = await pool.query(q1)
    res.status(200).json({ total: data.rowCount, data: data.rows })
  } catch (error) {
    console.log(error)
  }
})

router.get(
  '/orders/pending',
  validateToken,
  async (req: Request, res: Response) => {
    const whereObject = {
      store_id: req.user.store_id,
    }
    if (req.query.status) whereObject['status'] = req.query.status
    const q1 = qb('orders')
      .select('order_id', qb.raw('COUNT(*)'))
      .where(whereObject)
      .groupBy('order_id')
      .toQuery()
    try {
      const totalUnread = await (await pool.query(q1)).rowCount
      res.status(200).json({ totalUnread })
    } catch (error) {
      console.log(error)
    }
  }
)

router.get(
  '/orders/:id',
  validateToken,
  async (req: Request, res: Response) => {
    const whereObject = {
      store_id: req.user.store_id,
    }
    if (req.query.status) whereObject['status'] = req.query.status
    const q1 = qb('orders')
      .select('price', 'product_name')
      .innerJoin('products', 'orders.product_id', 'products.id')
      .where({ order_id: req.params.id })
      .toQuery()
    try {
      const data = await (await pool.query(q1)).rows
      res.status(200).json({ data })
    } catch (error) {
      console.log(error)
    }
  }
)
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
