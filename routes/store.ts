import { Router, Request, Response } from "express";

const stores = Router();

stores.get("/", async (req: Request, res: Response) => {
  res.sendStatus(200);
});

export default stores;
