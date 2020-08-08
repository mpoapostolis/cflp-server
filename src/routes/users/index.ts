import { Router } from 'express'
import login from './login'
import register from './register'
import facebook from './facebook'
import favorites from './favorites'

const users = Router()
users.use('/users', register, favorites, login, facebook)

export default users
