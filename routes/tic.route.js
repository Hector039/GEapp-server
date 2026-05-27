import { Router } from "express";
import TicController from "../controllers/tic.controller.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const ticController = new TicController();
const router = Router();

router.get("/gettic", handlePolicies(["PUBLIC"]), ticController.getTic);

export default router;
