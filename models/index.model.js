import usersModel from "./users.model.js";
import orgEventModel from "./orgEvents.model.js";
import reforestationProjectsModel from "./reforestationProjects.model.js";
import sessionsModel from "./sessions.model.js";
import userChallengesModel from "./userChallenges.model.js";
import triviaChallengesModel from "./challenges.models.js";

export default {
	users: usersModel,
	orgEvents: orgEventModel,
	sessions: sessionsModel,
	reforestationProjects: reforestationProjectsModel,
	triviaChallenges: triviaChallengesModel,
	userChallenges: userChallengesModel,
};
