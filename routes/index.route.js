import { Router } from "express";
import usersRouter from "./users.route.js";
import orgsRouter from "./orgs.route.js";

const router = Router();

router.use("/api/users", usersRouter);
router.use("/api/orgs", orgsRouter);

export default router;
