import { Router } from 'express'
import stores from './stores'
import transactions from './transactions'
import users from './users'
import products from './products'
import offers from './offers'

const boRouter = Router()

boRouter.use('/stores', stores)
boRouter.use('/offers', offers)
boRouter.use('/transactions', transactions)
boRouter.use('/users', users)
boRouter.use('/products', products)

export default boRouter
