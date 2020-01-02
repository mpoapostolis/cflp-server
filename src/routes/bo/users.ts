import { Router, Request, Response } from 'express'
import { redis } from '../..'

const users = Router()

users.get('/near', async (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query

  redis.GEORADIUS('key', lat, lng, radius, 'km', 'WITHCOORD', function(error, result) {
    if (error) {
      console.log(error)
      throw error
    }
    const data = result.map(arr => arr[1])
    res.json({ data: data.slice(0, 25), total: data.length })
  })
})

export default users
