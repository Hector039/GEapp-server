import { Router } from "express";
import UserChallengesController from "../controllers/userChallenges.controller.js";
import { userChallengesRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const userChallengesController = new UserChallengesController(
	userChallengesRepository
);
const router = Router();

router.post(
	"/saveuserchallenge",
	handlePolicies(["USER"]),
	userChallengesController.saveUserChallenge
);

router.get(
	"/getdonechallenges/:uid",
	handlePolicies(["USER"]),
	userChallengesController.getDoneChallenges
);

export default router;
