import { Router } from "express";
import RefProjectsController from "../controllers/refProjects.controller.js";
import { reforestationProjectsRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const refProjectsController = new RefProjectsController(
	reforestationProjectsRepository
);
const router = Router();

router.get(
	"/getrefproject/:pid",
	handlePolicies(["USER"]),
	refProjectsController.getRefProject
);

router.get(
	"/getallrefprojects",
	handlePolicies(["USER"]),
	refProjectsController.getAllRefProjects
);

router.post(
	"/saverefproject",
	handlePolicies(["USER"]),
	refProjectsController.saveRefProject
);

router.put(
	"/updaterefproject",
	handlePolicies(["USER"]),
	refProjectsController.updateRefProject
);

export default router;
