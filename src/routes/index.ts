import { Router } from 'express'
import employees from './employees'
import users from './users'
import stores from './stores'
import offers from './offers'
import products from './products'
import transactions from './transactions'
import upload from './uploads'

const router = Router()
router.use('/api', employees, users, stores, offers, products, transactions, upload)

export default router
