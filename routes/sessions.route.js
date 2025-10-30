import { Router } from "express";
import SessionsController from "../controllers/sessions.controller.js";
import { sessionsRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const sessionsController = new SessionsController(sessionsRepository);
const router = Router();

router.post(
	"/saveusersession",
	handlePolicies(["USER"]),
	sessionsController.saveUserSession
);

router.get(
	"/getuserinforewards/:uid/:date",
	handlePolicies(["USER"]),
	sessionsController.getUserInfoRewards
);

router.get(
	"/getdatachart/:uid/:filter",
	handlePolicies(["USER"]),
	sessionsController.getDataChart
);

export default router;
