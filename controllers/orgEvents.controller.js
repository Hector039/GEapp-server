import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class OrgEventsController {
	constructor(orgEventsRepo) {
		this.orgEventsRepo = orgEventsRepo;
	}

	getOrgEventProgress = async (req, res, next) => {
		const { eid } = req.params;
		try {
			const eventTotalSteps = await this.orgEventsRepo.getOrgEventProgress(eid);
			res.status(200).send(eventTotalSteps);
		} catch (error) {
			next(error);
		}
	};

	updateOrgEventSteps = async (req, res, next) => {
		const { eid, steps } = req.body;
		try {
			if (!eid || !steps) {
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

			await this.orgEventsRepo.updateOrgEventSteps(eid, newSteps);
			res.status(200).send();
		} catch (error) {
			next(error);
		}
	};

	generateUniqueCode = async () => {
		let isUnique = false;
		let finalCode = "";

		try {
			while (!isUnique) {
				// Generar un número aleatorio entre 100000 y 999999
				const randomNum = Math.floor(100000 + Math.random() * 900000);
				finalCode = randomNum.toString();

				// Verificar si el código ya existe en la base de datos
				const existingInvitation = await this.orgEventsRepo.findCode(finalCode);

				if (!existingInvitation) {
					isUnique = true; // El código está disponible
				}
			}

			return finalCode;
		} catch (error) {
			console.log("error en generate code: ", error);
		}
	};

	saveOrgEvent = async (req, res, next) => {
		const { name, orgName, orgEmail, numEmployees, projectId } = req.body;
		try {
			const invitationCode = await this.generateUniqueCode();
			const newEvent = await this.orgEventsRepo.saveOrgEvent({
				name,
				orgName,
				orgEmail,
				numEmployees,
				projectId,
				invitationCode,
			});
			res.status(200).send(newEvent);
		} catch (error) {
			next(error);
		}
	};
}
