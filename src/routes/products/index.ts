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
    console.log(data.rows)
    res.status(200).json({ data: data.rows, total: data.rowCount })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
})

read.get('/client', async (req: Request, res: Response) => {
  const { productSearchTerm = '', limit = 10, offset = 0 } = req.query

  //   address: "Αγίας Λαύρας, Αιγάλεω"
  // analytics: {purchased: 0, male: 0, female: 0,…}
  // coords: {x: 23.6757995, y: 37.9939679}
  // date_created: "2020-08-06T19:15:10.584Z"
  // description: null
  // geom: "0101000020E610000035272F3201AD37400CE313573AFF4240"
  // id: "4746e2a6-c49b-41f5-be38-11792ba591c0"
  // image: null
  // images: null
  // name: "ALEA IN STYLE"
  // price: 2.2
  // product_name: "kafes"
  // rating: null
  // store_id: "4746e2a6-c49b-41f5-be38-11792ba591c0"
  // tags: ["anapsiktika", "coffee"]

  const query = qb('products')
    .select(
      'address',
      'product_name',
      'products.id as id',
      'coords',
      'name as store_name',
      'price'
    )
    .innerJoin('stores', 'products.store_id', 'stores.id')
    .where('product_name', 'ilike', `${productSearchTerm}%`)
    .limit(+limit)
    .offset(+offset)
    .toQuery()

  try {
    const data = await await pool.query(query)
    console.log(data.rowCount)
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
