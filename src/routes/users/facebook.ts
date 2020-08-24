import { Router, Request, Response } from 'express'
import { getLoginResponse } from '../../utils/token'
import fetch from 'node-fetch'
import { groupByAge } from '../../utils'
import pool, { qb } from '../../utils/pgHelper'

const facebook = Router()
const URL = `https://graph.facebook.com`

async function getAppAccessToken() {
  const appToken = await fetch(
    `${URL}/oauth/access_token?client_id=${process.env['FB_CLIENT_ID']}&client_secret=${process.env['FB_CLIENT_SECRET']}&grant_type=client_credentials`
  )
  return await appToken.json()
}

async function debugUserToken(input_token: string, access_token: string) {
  const appToken = await fetch(
    `${URL}/debug_token?input_token=${input_token}&access_token=${access_token}`
  )
  return await appToken.json()
}

async function getUserInfo(id: string, access_token) {
  const picture = await fetch(
    `${URL}/${id}/picture?type=large&access_token=${access_token}`
  )
  const res = await fetch(
    `${URL}/${id}?fields=name,first_name,last_name,birthday,gender&access_token=${access_token}`
  )
  const infos = await res.json()
  const avatar = await picture.url
  return await {
    fb_id: infos.id,
    user_name: infos.name,
    first_name: infos.first_name,
    last_name: infos.last_name,
    gender: infos.gender,
    birthday: infos.birthday,
    avatar,
  }
}

facebook.post('/facebook', async (req: Request, res: Response) => {
  const appToken = await getAppAccessToken()

  const user = await debugUserToken(req.body.token, appToken.access_token)
  try {
    const q1 = qb('users')
      .where({
        fb_id: user.data.user_id,
      })
      .limit(1)
      .toQuery()
    const _user = await pool.query(q1)
    if (_user.rowCount > 0) {
      const response = await getLoginResponse(_user.rows[0])
      return res.status(200).json(response)
    } else {
      const infos = await getUserInfo(user.data.user_id, req.body.token)

      const q2 = qb('users')
        .insert({
          loyalty_points: 0,
          ...infos,
        })
        .toQuery()
      await pool.query(q2)
      const _user = await pool.query(q1)
      const response = await getLoginResponse(_user.rows[0])
      return res.status(200).json(response)
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ msg: error })
  }
})

export default facebook
