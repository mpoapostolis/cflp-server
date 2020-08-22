import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import create from './create'
import del from './delete'
import update from './update'
import pool, { qb } from '../../utils/pgHelper'

const read = Router()

read.get('/', validateToken, async (req: Request, res: Response) => {
  const {
    productSearchTerm = '',
    limit = 10,
    offset = 0,
    store_id = req.user.store_id,
  } = req.query
  const query = qb('products')
    .select('*')
    .where('product_name', 'ilike', `${productSearchTerm}%`)
    .andWhere({
      store_id,
    })
    .limit(+limit)
    .offset(+offset)
    .toQuery()
  try {
    const data = await await pool.query(query)
    res.status(200).json({ data: data.rows, total: data.rowCount })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})

read.get('/client-products', async (req: Request, res: Response) => {
  const { productSearchTerm = '', limit = 10, offset = 0 } = req.query

  let extraQuery: Record<string, any> = {}

  if (req.query.storeId) extraQuery['store_id'] = req.query.storeId
  if (req.query.favorites) extraQuery['user_id'] = req.query.favorites

  const query = qb('products')
    .select(
      'address',
      'product_name',
      'products.id as id',
      'stores.id as store_id',
      'coords',
      'name as store_name',
      'price'
    )
    .innerJoin('stores', 'products.store_id', 'stores.id')
    .modify(
      (q) =>
        req.query.favorites &&
        q.innerJoin('favorites', 'products.id', 'favorites.product_id')
    )
    .where('product_name', 'ilike', `${productSearchTerm}%`)
    .andWhere(extraQuery)
    .orderBy('price', 'asc')
    .limit(+limit)
    .offset(+offset)
    .toQuery()

  try {
    const data = await await pool.query(query)
    res.status(200).json({ data: data.rows, total: data.rowCount })
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: error })
  }
})

read.get('/:id', validateToken, async (req: Request, res: Response) => {
  const query = qb('products')
    .select('*')

    .andWhere({
      id: req.params.id,
    })
    .toQuery()
  const data = await await pool.query(query)

  try {
    res.status(200).json({ ...data.rows[0] })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})

const products = Router()

products.use('/products', create, read, update, del)

export default products
