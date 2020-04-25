import { Router } from 'express'
import login from './login'
import register from './register'
import facebook from './facebook'

const users = Router()
users.use('/users', register, login, facebook)

export default users
