import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class ChallengesController {
	constructor(challengesRepo) {
		this.challengesRepo = challengesRepo;
	}

	getAllChallenges = async (req, res, next) => {
		const { uid } = req.params;
		try {
			const allChallenges = await this.challengesRepo.getAllChallenges(uid);
			res.status(200).send(allChallenges);
		} catch (error) {
			next(error);
		}
	};

	getRandomChallenge = async (req, res, next) => {
		const { uid } = req.params;
		try {
			const lastChallenge = await this.challengesRepo.getRandomChallenge(uid);
			res.status(200).send(lastChallenge);
		} catch (error) {
			next(error);
		}
	};

	saveTriviachallenge = async (req, res, next) => {
		const {
			title,
			descr,
			icon,
			question,
			reward = 100,
			options,
			correctOptionIndex,
		} = req.body;
		try {
			if (!title || !descr) {
				CustomError.createError({
					message: "Faltan datos.",
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			let newChallenge = await this.challengesRepo.saveTriviachallenge({
				title,
				descr,
				icon,
				question,
				reward,
				options,
				correctOptionIndex,
			});
			res.status(200).send(newChallenge);
		} catch (error) {
			next(error);
		}
	};
}
