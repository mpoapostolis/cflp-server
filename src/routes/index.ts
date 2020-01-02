import { Router } from 'express'
import boRouter from './bo'
import auth from './auth'

const router = Router()

router.use('/auth', auth)
router.use('/api/bo', boRouter)

export default router
