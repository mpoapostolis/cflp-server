import { Router, Request, Response } from "express"
import { MongoHelper } from "../mongoHelper"
import { redis } from ".."

const stores = Router()

stores.get("/", async (req: Request, res: Response) => {
  const { offset = 0, limit = 25, lat, lng, id = "" } = req.query
  redis.GEOADD("key", lat, lng, id)
  setTimeout(() => {
    redis.ZREM("key", id)
  }, 30000)
  // await MongoHelper.connect()
  // const results = await MongoHelper.db
  //   .collection("stores")
  //   .find()
  //   .skip(+offset)
  //   .limit(+limit)
  //   .toArray()
  //   .catch(r => r)
  //   .finally(() => {
  //     MongoHelper.client.close()
  //   })
  res.json({})
})

stores.get("/near", async (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query

  redis.GEORADIUS("key", lat, lng, radius, "km", "WITHCOORD", function(
    error,
    result
  ) {
    if (error) {
      console.log(error)
      throw error
    }
    const data = result.map(arr => arr[1])
    res.json({ data: data.slice(0, 25), total: data.length })
  })
})

stores.get("/:id", async (req: Request, res: Response) => {
  await MongoHelper.connect()
  const results = await MongoHelper.db
    .collection("stores")
    .find({ id: +req.params.id })
    .toArray()
    .catch(r => r)
    .finally(() => {
      MongoHelper.client.close()
    })
  res.json(results)
})

stores.post("/", async (req: Request, res: Response) => {
  res.json({})
})

stores.put("/:id", async (req: Request, res: Response) => {
  res.json({})
})

stores.delete("/:id", async (req: Request, res: Response) => {
  res.json({})
})

stores.get("/id:/products", async (req: Request, res: Response) => {
  res.json({})
})

stores.put("/id:/products", async (req: Request, res: Response) => {
  res.json({})
})

stores.delete("/id:/products", async (req: Request, res: Response) => {
  res.json({})
})

export default stores
