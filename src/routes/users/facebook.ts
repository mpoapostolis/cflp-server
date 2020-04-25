import * as R from 'ramda'
import { Router, Request, Response } from 'express'
import { generateToken } from '../../utils/token'
import slourpDb from '../../utils/mongoHelper'
import fetch from 'node-fetch'
import { groupByAge } from '../../utils'

const facebook = Router()
const URL = `https://graph.facebook.com`

async function getAppAccessToken() {
  const appToken = await fetch(
    `${URL}/oauth/access_token?client_id=${process.env['FB_CLIENT_ID']}&client_secret=${process.env['FB_CLIENT_SECRET']}&grant_type=client_credentials`
  )
  return await appToken.json()
}

async function debugUserToken(input_token: string, access_token: string) {
  const appToken = await fetch(`${URL}/debug_token?input_token=${input_token}&access_token=${access_token}`)
  return await appToken.json()
}

async function getUserInfo(id: string, access_token) {
  const picture = await fetch(`${URL}/${id}/picture?type=large&access_token=${access_token}`)
  const res = await fetch(`${URL}/${id}?fields=name,first_name,last_name,birthday,gender&access_token=${access_token}`)
  const infos = await res.json()
  const avatar = await picture.url
  return await {
    fbId: infos.id,
    username: infos.name,
    firstName: infos.first_name,
    lastName: infos.last_name,
    gender: infos.gender,
    birthday: infos.birthday,
    avatar,
  }
}

facebook.post('/login/facebook', async (req: Request, res: Response) => {
  const appToken = await getAppAccessToken()
  const user = await debugUserToken(req.body.token, appToken.access_token)
  const db = await slourpDb()
  const users = db.collection('users')

  const foundUser = await users.findOne({ fbId: user.data.user_id })
  if (foundUser) {
    const infos = R.omit(['password', 'fbId'], foundUser)
    const token = await generateToken({ _id: user._id }, '1d', process.env['TOKEN'])
    const refreshToken = await generateToken({ _id: user._id }, '1w', process.env['TOKEN'])
    return res.status(200).json({
      ...infos,
      token,
      refreshToken,
    })
  } else {
    const userInfo = await getUserInfo(user.data.user_id, req.body.token)
    const ageGroup = groupByAge(userInfo.birthday)
    const newUser = await users
      .insertOne({ ...userInfo, loyaltyPoints: {}, groups: { ageGroup, gender: userInfo.gender } })
      .then((res) => res.ops[0])
      .catch((err) => res.status(500).send(err))
    const infos = R.omit(['password', 'fbId'], newUser)
    const token = generateToken({ _id: newUser._id }, '1d', process.env['TOKEN'])
    const refreshToken = await generateToken({ _id: newUser._id }, '1w', process.env['TOKEN'])
    return res.status(200).json({
      ...infos,
      token,
      refreshToken,
    })
  }
})

export default facebook
