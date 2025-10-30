import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class RefProjectsController {
	constructor(refProjectsRepo) {
		this.refProjectsRepo = refProjectsRepo;
	}

	getRefProject = async (req, res, next) => {
		const { pid } = req.params;
		try {
			const refProject = await this.refProjectsRepo.getRefProject(pid);
			res.status(200).send(refProject);
		} catch (error) {
			next(error);
		}
	};

	getAllRefProjects = async (req, res, next) => {
		try {
			const refProjects = await this.refProjectsRepo.getAllRefProjects();
			res.status(200).send(refProjects);
		} catch (error) {
			next(error);
		}
	};

	saveRefProject = async (req, res, next) => {
		const { name, location, descr, treeGoal } = req.body;
		try {
			if (!name || !descr || !location || !treeGoal) {
				CustomError.createError({
					message: "Faltan datos.",
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			let newRefProject = await this.refProjectsRepo.saveRefProject({
				name,
				location,
				descr,
				treeGoal,
			});
			res.status(200).send(newRefProject);
		} catch (error) {
			next(error);
		}
	};

	updateRefProject = async (req, res, next) => {
		const { pid, keyToUpdate, valueToUpdate } = req.body;
		try {
			await this.refProjectsRepo.updateRefProjectField(
				pid,
				keyToUpdate,
				valueToUpdate
			);
			res.status(200).send();
		} catch (error) {
			next(error);
		}
	};
}
