import { Router, Request, Response } from "express"

const users = Router()

users.get("/:id/give-lp", async (req: Request, res: Response) => {
  res.json({
    a: 1
  })
})

users.get("/:id/spent-lp", async (req: Request, res: Response) => {
  res.json({})
})

export default users
