import { Router } from 'express'
import stores from './stores'
import auth from './auth'
import offers from './offers'
import transactions from './transactions'
import users from './users'
import products from './products'

const r = Router()

r.use('/stores', stores)
r.use('/auth', auth)
r.use('/offers', offers)
r.use('/transactions', transactions)
r.use('/users', users)
r.use('/products', products)

const router = Router()

router.use('/api', r)

export default router
