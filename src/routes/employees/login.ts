import * as bcrypt from 'bcrypt'
import * as R from 'ramda'
import { Router, Request, Response } from 'express'
import { generateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  const db = await slourpDb()

  const employee = await db.collection('employees').findOne({ username: req.body.username })

  if (!employee) return res.status(401).json({ msg: 'Username or password is incorrect' })

  await bcrypt.compare(req.body.password, employee.password, async (err, same) => {
    if (err) return res.status(500).json({ msg: err })
    if (same) {
      const ids = R.pick(['_id', 'storeId'], employee)
      const infos = R.omit(['password'], employee)
      const token = await generateToken(ids, '1d', process.env['TOKEN'])
      const refreshToken = await generateToken(ids, '1w', process.env['TOKEN'])
      return res.status(200).json({
        ...infos,
        token,
        refreshToken,
      })
    } else return res.status(401).json({ msg: 'Username or password is incorrect' })
  })
})

export default router
