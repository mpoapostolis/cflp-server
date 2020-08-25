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
    offset = 0,
    store_id = req.user.store_id,
  } = req.query
  const query = qb('products')
    .select('*')
    .where('product_name', 'ilike', `${searchTerm}%`)
    .andWhere({
      store_id,
    })
    .orderBy('date_created', 'desc')

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
  const { productSearchTerm = '', limit = 10, offset = 0, tags } = req.query

  let extraQuery: Record<string, any> = {}

  if (req.query.storeId) extraQuery['store_id'] = req.query.storeId
  if (req.query.favorites) extraQuery['user_id'] = req.query.favorites
  if (tags) extraQuery['has_tag'] = 't'

  const _tags = Array.isArray(tags) ? tags : [tags]

  console.log(_tags)

  const tableName = tags ? 't1' : 'products'

  const query = qb(tableName)
    .modify((q) => {
      if (tags)
        q.with(
          't1',
          qb('products').select(
            'id',
            'product_name',
            'store_id',
            'price',
            'description',
            'images',
            'tags',
            qb.raw(
              `tags::text[] && ARRAY[${_tags.map((e) => `'${e}'`)}] as has_tag`
            )
          )
        )
    })
    .select(
      'address',
      'product_name',
      `${tableName}.id as id`,
      'stores.id as store_id',
      'coords',
      'tags',
      'name as store_name',
      'price'
    )
    .innerJoin('stores', `${tableName}.store_id`, 'stores.id')
    .modify((q) => {
      req.query.favorites &&
        q.innerJoin('favorites', `${tableName}.id`, 'favorites.product_id')
    })

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
