import { Router } from "express";
import UsersController from "../controllers/users.controller.js";
import { usersRepository } from "../repository/index.repository.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { isSessionOn } from "../middlewares/isSessionOn.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";
import { uploads } from "../middlewares/multer.js";
import { passportCall } from "../middlewares/passportCall.js";
import { resizeAvatar } from "../middlewares/sharpMiddleware.js";

const usersController = new UsersController(usersRepository);
const router = Router();

router.post(
	"/login",
	isSessionOn(),
	passportCall("login"),
	handlePolicies(["PUBLIC"]),
	usersController.userLogin,
);
router.post(
	"/signin",
	isSessionOn(),
	passportCall("signin"),
	handlePolicies(["PUBLIC"]),
	usersController.userSignin,
);
router.get(
	"/sendrestorationemail/:email",
	isSessionOn(),
	handlePolicies(["PUBLIC"]),
	usersController.sendRestorationEmail,
);
router.post(
	"/passrestoration",
	isSessionOn(),
	handlePolicies(["PUBLIC"]),
	usersController.restorePass,
);
router.post(
	"/changeavatar",
	userPassJwt(),
	handlePolicies(["USER"]),
	uploads.single("avatar"),
	resizeAvatar,
	usersController.updateUserAvatar,
);
router.put(
	"/updateuserstatus",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserStatus,
);
router.put(
	"/reactivateuserstatus",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.reactivateUserStatus,
);
router.put(
	"/changeemail",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserEmail,
);
router.put(
	"/changepassword",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserPassword,
);
router.put(
	"/updateusertotalsteps",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserTotalSteps,
);

router.get(
	"/getusertotalsteps",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.getUserTotalSteps,
);

router.get(
	"/getuserstreak",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.getUserStreak,
);

router.put(
	"/updateuserstreak",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.updateUserStreak,
);

router.put(
	"/markonboardingseen",
	userPassJwt(),
	handlePolicies(["USER"]),
	usersController.markHasSeenOnboarding,
);

export default router;
