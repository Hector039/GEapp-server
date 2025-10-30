import { Router } from "express";
import ChallengesController from "../controllers/challenges.controller.js";
import { challengesRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const challengesController = new ChallengesController(challengesRepository);
const router = Router();

router.post(
	"/savetriviachallenge",
	handlePolicies(["USER"]),
	challengesController.saveTriviachallenge
);

router.get(
	"/getallchallenges/:uid",
	handlePolicies(["USER"]),
	challengesController.getAllChallenges
);

router.get(
	"/getrandomchallenge/:uid",
	handlePolicies(["USER"]),
	challengesController.getRandomChallenge
);

export default router;
