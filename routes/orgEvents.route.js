import { Router } from "express";
import OrgEventsController from "../controllers/orgEvents.controller.js";
import { orgsEventsRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const orgEventsController = new OrgEventsController(orgsEventsRepository);
const router = Router();

router.get(
	"/getorgeventtotalsteps/:eid",
	handlePolicies(["USER"]),
	orgEventsController.getOrgEventTotalSteps
);

router.put(
	"/updateorgeventsteps",
	handlePolicies(["USER"]),
	orgEventsController.updateOrgEventSteps
);

router.post(
	"/saveorgevent",
	handlePolicies(["USER"]),
	orgEventsController.saveOrgEvent
);
/* 
router.get(
    "/getdonechallenges/:uid",
    handlePolicies(["USER"]),
    userChallengesController.getDoneChallenges
);

router.delete(
    "/stopchallenge/:uid/:cid",
    handlePolicies(["USER"]),
    userChallengesController.stopChallenge
);
 */
export default router;
