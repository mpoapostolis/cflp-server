import { Router } from 'express'
import products from './products'

const transactions = Router()
transactions.use('/transactions', products)

export default transactions
