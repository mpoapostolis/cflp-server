import { Router } from "express";
import stores from "./store";

const router = Router();

router.use("/stores", stores);

export default router;
