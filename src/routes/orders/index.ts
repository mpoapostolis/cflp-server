import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'

import pool, { qb } from '../../utils/pgHelper'
import { validateToken, UserTypeToken } from '../../utils/token'
import { v4 as uuidv4 } from 'uuid'
import { groupByAge } from '../../utils'

import * as R from 'ramda'
import * as jwt from 'jsonwebtoken'

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

  const storeId = req.params.storeId
  clients[storeId] = res
  req.on('close', () => {
    console.log(`${storeId} Connection closed`)
    delete clients[storeId]
  })
}

router.get('/listen-orders/:storeId', eventsHandler)

router.get(
  '/order/:id/get-status',
  validateToken,
  async (req: Request, res) => {
    const q1 = qb('orders')
      .select('status')
      .where({ order_id: req.params.id })
      .toQuery()
    const [{ status }] = await (await pool.query(q1)).rows
    res.status(200).json({ status })
  }
)

router.post(
  '/order/:id/place-order',
  validateToken,
  async (req: Request, res) => {
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

      clients[req.params.id]?.write(`data: new notification \n\n`)

      res.status(200).json({ order_id })
    } catch (error) {
      console.log(error)
    }
  }
)

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
      status: 'pending',
    }
    if (req.query.status) whereObject['status'] = req.query.status as string
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

router.post(
  '/orders/:id/approve',
  validateToken,
  async (req: Request, res: Response) => {
    const client = await pool.connect()

    const q1 = qb('orders')
      .select('price', 'users.birthday', 'users.gender', 'tags')
      .innerJoin('products', 'orders.product_id', 'products.id')
      .innerJoin('users', 'orders.user_id', 'users.id')
      .where({
        order_id: req.params.id,
      })
      .toQuery()

    const q2 = qb('orders')
      .update({
        status: 'complete',
      })
      .where({ order_id: req.params.id })
      .toQuery()

    try {
      await client.query('BEGIN')
      const orders = (await client.query(q1)).rows

      await client.query(q2)
      const loyalty_points =
        orders.reduce((acc, curr) => acc + curr.price, 0) * 90
      const q3 = qb('users')
        .increment('loyalty_points', loyalty_points)
        .where({
          id: req.user.id,
        })
        .toQuery()
      await client.query(q3)

      const tags = R.uniq(
        orders.reduce((acc, curr) => [...acc, ...curr?.tags], [])
      )
      const { birthday, gender } = orders[0]
      const ageGroup = groupByAge(birthday)

      tags.forEach(async (tag_name) => {
        await client.query(
          qb('tags')
            .increment(`purchased`, 1)
            .increment(`${gender}_${ageGroup}`, 1)
            .where({ tag_name })
            .toQuery()
        )
      })

      await client.query('COMMIT')
      res.status(200).json({ msg: 'we are cool' })
    } catch (e) {
      console.log(e)
      await client.query('ROLLBACK')
      res.status(500).json({ msg: e })
    } finally {
      client.release()
    }
  }
)

export default router
