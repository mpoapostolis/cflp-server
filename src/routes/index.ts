import { Router } from 'express'
import users from './users'
import stores from './stores'
import products from './products'
import upload from './uploads'
import tags from './tags'
import orders from './orders'
import geolog from './geolog'

const router = Router()
router.use('/api', users, orders, geolog, stores, tags, products, upload)

export default router
