import { Router } from 'express'
import products from './products'
import offer from './offer'

const transactions = Router()
transactions.use('/transactions', products, offer)

export default transactions
