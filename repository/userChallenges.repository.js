import mongoose from "mongoose";

export default class UserChallengesRepository {
	constructor(userChallengeModel) {
		this.userChallengeModel = userChallengeModel;
	}

	isChallengeExists = async (uid, cid) => {
		let challengeExists = await this.userChallengeModel.findOne({
			user: uid,
			triviaId: cid,
		});
		if (challengeExists) return true;
		return false;
	};

	saveNewChallenge = async (challenge) => {
		const newChallenge = {
			user: new mongoose.Types.ObjectId(challenge.uid),
			triviaId: new mongoose.Types.ObjectId(challenge.cid),
		};

		let newChallengeSaved = new this.userChallengeModel(newChallenge).save();
		return newChallengeSaved;
	};

	getDoneChallenges = async (uid) => {
		let doneChallenges = await this.userChallengeModel
			.find({
				user: uid,
				isDone: true,
			})
			.populate("triviaId");
		return doneChallenges;
	};
}
