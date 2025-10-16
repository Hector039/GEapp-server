import { Router } from "express";
import OrgsController from "../controllers/orgs.controller.js";
import { orgsRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";

const orgsController = new OrgsController(orgsRepository);
const router = Router();

router.get("/getorgs", handlePolicies(["PUBLIC"]), orgsController.getAllOrgs);
router.post("/saveorg", handlePolicies(["PUBLIC"]), orgsController.saveOrg);

export default router;
