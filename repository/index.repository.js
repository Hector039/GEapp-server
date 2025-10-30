import models from "../models/index.model.js";

export let usersRepository,
	orgsEventsRepository,
	sessionsRepository,
	challengesRepository,
	userChallengesRepository,
	reforestationProjectsRepository;

const { default: usersDB } = await import("./users.repository.js");
usersRepository = new usersDB(models.users);

const { default: orgsEventsDB } = await import("./orgsEvents.repository.js");
orgsEventsRepository = new orgsEventsDB(models.orgEvents);

const { default: sessionsDB } = await import("./sessions.repository.js");
sessionsRepository = new sessionsDB(models.sessions);

const { default: challengesDB } = await import("./challenges.repository.js");
challengesRepository = new challengesDB(
	models.triviaChallenges,
	models.userChallenges
);

const { default: userChalDB } = await import("./userChallenges.repository.js");
userChallengesRepository = new userChalDB(models.userChallenges);

const { default: refProjectsDB } = await import("./refProjects.repository.js");
reforestationProjectsRepository = new refProjectsDB(
	models.reforestationProjects
);
