import { Router } from "express"
import stores from "./stores"

const router = Router()

router.use("/stores", stores)

export default router
