import { Router } from "express";
import RefProjectsController from "../controllers/refProjects.controller.js";
import { reforestationProjectsRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const refProjectsController = new RefProjectsController(
	reforestationProjectsRepository,
);
const router = Router();

router.get(
	"/getrefproject/:pid",
	userPassJwt(),
	handlePolicies(["USER"]),
	refProjectsController.getRefProject,
);

router.get(
	"/getallrefprojects",
	userPassJwt(),
	handlePolicies(["USER"]),
	refProjectsController.getAllRefProjects,
);

router.post(
	"/saverefproject",
	userPassJwt(),
	handlePolicies(["ADMIN"]),
	refProjectsController.saveRefProject,
);

router.put(
	"/updaterefproject",
	userPassJwt(),
	handlePolicies(["ADMIN"]),
	refProjectsController.updateRefProject,
);

export default router;
