export default class SessionsController {
	constructor(repo) {
		this.sessionRepo = repo;
	}

	getUserSession = async (req, res, next) => {
		const { uid, date } = req.params;
		try {
			const session = await this.sessionRepo.getUserSession(uid, date);
			res.status(200).send(session);
		} catch (error) {
			next(error);
		}
	};

	saveUserSession = async (req, res, next) => {
		const { uid, steps, date } = req.body;
		try {
			let newSession = await this.sessionRepo.saveSession({ uid, steps, date });
			res.status(200).send(newSession);
		} catch (error) {
			next(error);
		}
	};
}
