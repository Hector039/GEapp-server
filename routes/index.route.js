import { Router } from "express";
import usersRouter from "./users.route.js";
import ticRouter from "./tic.route.js";
import sessionsRouter from "./sessions.route.js";
import challengesRouter from "./challenges.route.js";
import userChallengesRouter from "./userChallenges.route.js";
import orgEventsRouter from "./orgEvents.route.js";
import refProjectsRouter from "./refProjects.route.js";

const router = Router();

router.use("/api/users", usersRouter);
router.use("/api/tic", ticRouter);
router.use("/api/sessions", sessionsRouter);
router.use("/api/challenges", challengesRouter);
router.use("/api/userchallenges", userChallengesRouter);
router.use("/api/orgevents", orgEventsRouter);
router.use("/api/refprojects", refProjectsRouter);

export default router;
