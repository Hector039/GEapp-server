import { Router } from "express";
import UserChallengesController from "../controllers/userChallenges.controller.js";
import { userChallengesRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const userChallengesController = new UserChallengesController(
	userChallengesRepository,
);
const router = Router();

router.post(
	"/saveuserchallenge",
	userPassJwt(),
	handlePolicies(["USER"]),
	userChallengesController.saveUserChallenge,
);

router.get(
	"/getdonechallenges",
	userPassJwt(),
	handlePolicies(["USER"]),
	userChallengesController.getDoneChallenges,
);

export default router;
