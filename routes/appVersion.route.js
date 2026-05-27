import { Router } from "express";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import AppVersionController from "../controllers/appVersion.controller.js";

const appVersionController = new AppVersionController();
const router = Router();

router.get(
	"/getversion",
	handlePolicies(["PUBLIC"]),
	appVersionController.getVersion,
);

export default router;
