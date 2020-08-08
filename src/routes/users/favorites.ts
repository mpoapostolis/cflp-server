import * as Joi from '@hapi/joi'
import { Router, Request, Response } from 'express'
import { validateToken } from '../../utils/token'
import pool, { qb } from '../../utils/pgHelper'
import { makeErrObj } from '../../utils/error'

const favorites = Router()

favorites.get(
  '/favorites',
  validateToken,
  async (req: Request, res: Response) => {
    const query = qb('favorites')
      .select('product_id', 'images', 'price', 'description', 'product_name')
      .innerJoin('products', 'favorites.product_id', 'products.id')
      .where({ user_id: req.user.id })
      .toQuery()
    try {
      const data = await await pool.query(query)
      res.status(200).json(data.rows)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error })
    }
  }
)

favorites.post(
  '/favorites/:id',
  validateToken,
  async (req: Request, res: Response) => {
    const query = qb('favorites')
      .insert({
        user_id: req.user.id,
        product_id: req.params.id,
      })
      .toQuery()
    try {
      const data = await await pool.query(query)
      res.status(200).json({})
    } catch (error) {
      res.status(500).json({ msg: error })
    }
  }
)

favorites.delete(
  '/favorites/:id',
  validateToken,
  async (req: Request, res: Response) => {
    const query = qb('favorites')
      .where({
        user_id: req.user.id,
        product_id: req.params.id,
      })
      .delete()
      .toQuery()

    try {
      const x = await await pool.query(query)
      console.log(x)
      res.status(200).json({ msg: 'ok' })
    } catch (error) {
      res.status(500).json({ msg: error })
    }
  }
)

export default favorites
