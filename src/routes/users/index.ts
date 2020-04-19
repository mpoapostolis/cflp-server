import { Router } from 'express'
import login from './login'
import register from './register'

const users = Router()
users.use('/users', register, login)

export default users
