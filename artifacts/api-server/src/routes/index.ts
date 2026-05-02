import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import konbiniRouter from "./konbini.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(konbiniRouter);

export default router;
