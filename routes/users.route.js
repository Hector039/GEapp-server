import { Router } from "express";
import UsersController from "../controllers/users.controller.js";
import { usersRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { isSessionOn } from "../middlewares/isSessionOn.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";
import { uploads } from "../middlewares/multer.js";
import { passportCall } from "../middlewares/passportCall.js";

const usersController = new UsersController(usersRepository);
const router = Router();

router.post(
	"/login",
	isSessionOn(),
	passportCall("login"),
	handlePolicies(["PUBLIC"]),
	usersController.userSigninOrLogin
);
router.post(
	"/signin",
	isSessionOn(),
	passportCall("signin"),
	handlePolicies(["PUBLIC"]),
	usersController.userSigninOrLogin
);
router.get(
	"/passrestoration/:email",
	isSessionOn(),
	handlePolicies(["PUBLIC"]),
	usersController.passRestoration
);
router.post(
	"/forgot",
	isSessionOn(),
	handlePolicies(["PUBLIC"]),
	usersController.userForgotPass
);
router.post(
	"/changeavatar/:uid",
	userPassJwt(),
	handlePolicies(["USER"]),
	uploads.single("avatar"),
	usersController.updateUserAvatar
);
router.put(
	"/updateuserstatus/:uid",
	userPassJwt(),
	handlePolicies(["PUBLIC"]),
	usersController.updateUserStatus
);
router.put(
	"/changeemail",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserEmail
);
router.put(
	"/changepassword",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserPassword
);
router.put(
	"/updateusertotalsteps",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserTotalSteps
);
router.get(
	"/getnewuserscommunity",
	handlePolicies(["PUBLIC"]),
	usersController.getNewUsersCommunity
);
router.get(
	"/getusertotalsteps/:uid",
	handlePolicies(["USER"]),
	usersController.getUserTotalSteps
);
router.get(
	"/gettopusers",
	handlePolicies(["PUBLIC"]),
	usersController.getTopUsers
);
router.get(
	"/getcommunitysteps",
	handlePolicies(["PUBLIC"]),
	usersController.getCommunitySteps
);
router.get(
	"/getorgusers/:uid",
	handlePolicies(["USER"]),
	usersController.getOrgUsers
);

export default router;
