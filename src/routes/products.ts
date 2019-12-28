import { Router, Request, Response } from 'express'

const products = Router()

products.get('/products', async (req: Request, res: Response) => {
  res.json({})
})

products.get('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

products.put('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

products.delete('/products/:id', async (req: Request, res: Response) => {
  res.json({})
})

export default products
