export default class ChallengesRepository {
	constructor(triviaModel, userChallengesModel) {
		this.triviaModel = triviaModel;
		this.userChallengesModel = userChallengesModel;
	}

	getAllChallenges = async (uid) => {
		const userChallenges = await this.userChallengesModel
			.find({ user: uid, isDone: false })
			.populate("triviaId")
			.limit(6);

		return userChallenges;
	};

	saveTriviachallenge = async (challenge) => {
		let newChallengeSaved = new this.triviaModel(challenge).save();
		return newChallengeSaved;
	};

	getRandomChallenge = async (uid) => {
		const userChallenges = await this.userChallengesModel
			.find({ user: uid })
			.select("triviaId");

		const usedTriviaIds = userChallenges
			.filter((uc) => uc.triviaId)
			.map((uc) => uc.triviaId);

		const triviaChallenges = await this.triviaModel.aggregate([
			{
				$match: {
					_id: { $nin: usedTriviaIds },
				},
			},
			{ $sample: { size: 1 } },
		]);

		if (triviaChallenges.length > 0) {
			return triviaChallenges[0];
		}
		return null;
	};
}
