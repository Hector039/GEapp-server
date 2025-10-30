import { Router } from "express";
import TicController from "../controllers/tic.controller.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const sessionsController = new TicController();
const router = Router();

router.get("/gettic", handlePolicies(["PUBLIC"]), sessionsController.getTic);

export default router;
