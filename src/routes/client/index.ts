import { Router } from 'express'
import stores from './stores'

const clientRouter = Router()

clientRouter.use('/stores', stores)

export default clientRouter
