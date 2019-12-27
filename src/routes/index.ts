import { Router } from 'express'
import stores from './stores'
import auth from './auth'
import offers from './offers'
import transactions from './transactions'
import users from './users'

const router = Router()

router.use('/stores', stores)
router.use('/auth', auth)
router.use('/offers', offers)
router.use('/transactions', transactions)
router.use('/users', users)

export default router
