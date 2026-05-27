import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class UserChallengesController {
	constructor(userChallengeRepo) {
		this.userChallengeRepo = userChallengeRepo;
	}

	saveUserChallenge = async (req, res, next) => {
		const { cid } = req.body;
		const uid = req.user;
		try {
			const isChallengeExists = await this.userChallengeRepo.isChallengeExists(
				uid,
				cid,
			);
			if (isChallengeExists) {
				CustomError.createError({
					message: `Ya tienes este desafío terminado.`,
					code: TErrors.CONFLICT,
					statusCode: 400,
				});
			}

			let newChallenge = await this.userChallengeRepo.saveNewChallenge({
				uid,
				cid,
			});

			res.status(200).send(newChallenge);
		} catch (error) {
			next(error);
		}
	};

	getDoneChallenges = async (req, res, next) => {
		try {
			const doneChallenges = await this.userChallengeRepo.getDoneChallenges(
				req.user,
			);
			res.status(200).send(doneChallenges);
		} catch (error) {
			next(error);
		}
	};
}
