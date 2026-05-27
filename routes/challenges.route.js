import { Router } from "express";
import ChallengesController from "../controllers/challenges.controller.js";
import { challengesRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const challengesController = new ChallengesController(challengesRepository);
const router = Router();

router.post(
	"/savetriviachallenge",
	userPassJwt(),
	handlePolicies(["ADMIN"]),
	challengesController.saveTriviachallenge,
);

router.get(
	"/getallchallenges",
	userPassJwt(),
	handlePolicies(["USER"]),
	challengesController.getAllChallenges,
);

router.get(
	"/getrandomchallenge",
	userPassJwt(),
	handlePolicies(["USER"]),
	challengesController.getRandomChallenge,
);

export default router;
