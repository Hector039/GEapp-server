import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class SessionsController {
	constructor(repo) {
		this.sessionRepo = repo;
	}

	getUserInfoRewards = async (req, res, next) => {
		const { uid, date } = req.params;
		const yesterday = new Date(date + "T00:00:00.000Z");
		yesterday.setUTCDate(yesterday.getUTCDate() - 1);
		try {
			const session = await this.sessionRepo.getUserInfoRewards(uid, yesterday);
			res.status(200).send(session);
		} catch (error) {
			next(error);
		}
	};

	saveUserSession = async (req, res, next) => {
		const { uid, steps, date } = req.body;
		// Establece la hora a medianoche IMPORTANTE
		let newDate = new Date(date + "T00:00:00.000Z");
		let dateISO = newDate.toISOString();
		//console.log("date ISO in string in saveUserSession controller:", dateISO);
		try {
			let newSession = await this.sessionRepo.saveUserSession({
				uid,
				steps,
				dateISO,
			});
			res.status(200).send(newSession);
		} catch (error) {
			next(error);
		}
	};

	getDataChart = async (req, res, next) => {
		const { uid, filter } = req.params;
		if (!["Semana", "Mes", "Año"].includes(filter)) {
			CustomError.createError({
				message: "Filtro inválido. Debe ser 'Semana', 'Mes' o 'Año'.",
				code: TErrors.INVALID_TYPES,
				statusCode: 400,
			});
		}
		try {
			const chartData = await this.sessionRepo.getDataChart(uid, filter);
			res.status(200).send(chartData);
		} catch (error) {
			next(error);
		}
	};
}
