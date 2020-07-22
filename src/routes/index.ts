import { Router } from 'express'
import users from './users'
import stores from './stores'
import products from './products'
import upload from './uploads'

const router = Router()
router.use('/api', users, stores, products, upload)

export default router
