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
	"/getusersession/:uid/:date",
	handlePolicies(["USER"]),
	sessionsController.getUserSession
);

export default router;
