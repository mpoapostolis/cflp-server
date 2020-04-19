import * as bcrypt from 'bcrypt'
import * as R from 'ramda'
import { Router, Request, Response } from 'express'
import { generateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  const db = await slourpDb()

  const user = await db.collection('users').findOne({ username: req.body.username })

  if (!user) return res.status(401).json({ msg: 'Username or password is incorrect' })

  await bcrypt.compare(req.body.password, user.password, async (err, same) => {
    if (err) return res.status(500).json({ msg: err })
    if (same) {
      const infos = R.omit(['password'], user)
      const token = await generateToken({ _id: user._id }, '1d', process.env['TOKEN'])
      const refreshToken = await generateToken({ _id: user._id }, '1w', process.env['TOKEN'])
      return res.status(200).json({
        ...infos,
        token,
        refreshToken,
      })
    } else return res.status(401).json({ msg: 'Username or password is incorrect' })
  })
})

export default router
