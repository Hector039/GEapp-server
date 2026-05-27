import { Router } from "express";
import SessionsController from "../controllers/sessions.controller.js";
import {
	sessionsRepository,
	usersRepository,
} from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const sessionsController = new SessionsController(
	sessionsRepository,
	usersRepository,
);
const router = Router();

router.post(
	"/saveusersession",
	userPassJwt(),
	handlePolicies(["USER"]),
	sessionsController.saveUserSession,
);

router.get(
	"/getuserinforewards/:date",
	userPassJwt(),
	handlePolicies(["USER"]),
	sessionsController.getUserInfoRewards,
);

router.get(
	"/getdatachart/:filter",
	userPassJwt(),
	handlePolicies(["USER"]),
	sessionsController.getDataChart,
);

export default router;
