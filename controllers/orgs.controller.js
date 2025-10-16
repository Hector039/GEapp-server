import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class OrgsController {
	constructor(repo) {
		this.orgRepo = repo;
	}

	getAllOrgs = async (req, res, next) => {
		try {
			const orgs = await this.orgRepo.getAllOrgs();
			res.status(200).send(orgs);
		} catch (error) {
			next(error);
		}
	};

	saveOrg = async (req, res, next) => {
		const { name, description } = req.body;
		try {
			let newOrg = await this.orgRepo.saveOrg({ name, description });
			res.status(200).send(newOrg);
		} catch (error) {
			next(error);
		}
	};
}
