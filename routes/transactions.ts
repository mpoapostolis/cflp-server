import { Router, Request, Response } from "express"

const transactions = Router()

transactions.post("/", async (req: Request, res: Response) => {
  res.json({
    a: 1
  })
})

export default transactions
