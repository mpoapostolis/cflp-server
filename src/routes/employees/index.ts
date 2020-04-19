import { Router } from 'express'
import login from './login'
import register from './register'

const employees = Router()
employees.use('/employees', register, login)

export default employees
