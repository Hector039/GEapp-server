import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class SessionsController {
	constructor(repo, usersRepository) {
		this.sessionRepo = repo;
		this.usersRepo = usersRepository;
	}

	getUserInfoRewards = async (req, res, next) => {
		const { date } = req.params;
		const yesterday = new Date(date + "T00:00:00.000Z");
		yesterday.setUTCDate(yesterday.getUTCDate() - 1);
		console.log("today date in getUserInfo Rewards: ", date);
		console.log("yesterday date in getUserInfo Rewards: ", yesterday);

		try {
			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			if (user.lastCheckReward === date) {
				console.log("Recompensas ya registradas hoy.");
				return res.status(200).send("Recompensas ya registradas hoy.");
			}
			const session = await this.sessionRepo.getUserInfoRewards(
				req.user,
				yesterday,
			);
			await this.usersRepo.updateUserField(req.user, "lastCheckReward", date);
			//console.log("session in getUserInfo Rewards: ", session);
			res.status(200).send(session);
		} catch (error) {
			next(error);
		}
	};

	saveUserSession = async (req, res, next) => {
		const { steps, date } = req.body;
		// Establece la hora a medianoche IMPORTANTE
		let newDate = new Date(date + "T00:00:00.000Z");
		let dateISO = newDate.toISOString();
		console.log("date ISO in string in saveUserSession controller:", dateISO);
		try {
			if (!steps || !date) {
				CustomError.createError({
					message: `Faltan datos o están erróneos.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}

			const newSteps = Number(steps);
			if (!Number.isInteger(newSteps) || newSteps < 0 || newSteps > 80000) {
				CustomError.createError({
					message: `Pasos inválidos.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			const uid = req.user;
			let newSession = await this.sessionRepo.saveUserSession({
				uid,
				newSteps,
				dateISO,
			});
			res.status(200).send(newSession);
		} catch (error) {
			next(error);
		}
	};

	getDataChart = async (req, res, next) => {
		const { filter } = req.params;
		if (!["Semana", "Mes", "Año"].includes(filter)) {
			CustomError.createError({
				message: "Filtro inválido. Debe ser 'Semana', 'Mes' o 'Año'.",
				code: TErrors.INVALID_TYPES,
				statusCode: 400,
			});
		}
		try {
			const chartData = await this.sessionRepo.getDataChart(req.user, filter);
			res.status(200).send(chartData);
		} catch (error) {
			next(error);
		}
	};
}
