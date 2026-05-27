import { Router } from "express";
import OrgEventsController from "../controllers/orgEvents.controller.js";
import { orgsEventsRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const orgEventsController = new OrgEventsController(orgsEventsRepository);
const router = Router();

router.get(
	"/getorgeventprogress/:eid",
	userPassJwt(),
	handlePolicies(["USER"]),
	orgEventsController.getOrgEventProgress,
);

router.put(
	"/updateorgeventsteps",
	userPassJwt(),
	handlePolicies(["USER"]),
	orgEventsController.updateOrgEventSteps,
);

router.post(
	"/saveorgevent",
	userPassJwt(),
	handlePolicies(["ADMIN"]),
	orgEventsController.saveOrgEvent,
);

export default router;
