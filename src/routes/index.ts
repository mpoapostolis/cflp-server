import { Router } from 'express'
import boRouter from './bo'
import clientRouter from './client'
import auth from './auth'

const router = Router()

router.use('/auth', auth)
router.use('/api/bo', boRouter)
router.use('/api/client', clientRouter)

export default router
