import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import create from './create'
import del from './delete'
import update from './update'
import pool, { qb } from '../../utils/pgHelper'

const read = Router()

read.get('/', validateToken, async (req: Request, res: Response) => {
  const {
    searchTerm = '',
    limit = 10,
    skip = 0,
    store_id = req.user.store_id,
  } = req.query
  const query = qb('products')
    .select('*')
    .where('product_name', 'like', `${searchTerm}%`)
    .where({
      store_id,
    })
    .limit(+limit)
    .offset(+skip)
    .toQuery()
  try {
    const data = await await pool.query(query)
    res.status(200).json({ data: data.rows, total: data.rowCount })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})

read.get('/client', validateToken, async (req: Request, res: Response) => {
  const {
    searchTerm = '',
    limit = 10,
    skip = 0,
    store_id = req.user.store_id,
  } = req.query

  const query = qb('products')
    .select('*')
    .innerJoin('stores', 'products.store_id', 'stores.id')
    .where('product_name', 'like', `${searchTerm}%`)
    .andWhere({
      store_id,
    })
    .limit(+limit)
    .offset(+skip)
    .toQuery()
  try {
    const data = await await pool.query(query)
    res.status(200).json({ data: data.rows, total: data.rowCount })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})

const products = Router()

products.use('/products', create, read, update, del)

export default products
