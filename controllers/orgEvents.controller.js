import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class OrgEventsController {
	constructor(orgEventsRepo) {
		this.orgEventsRepo = orgEventsRepo;
	}

	getOrgEventTotalSteps = async (req, res, next) => {
		const { eid } = req.params;
		try {
			const eventTotalSteps = await this.orgEventsRepo.getOrgEventTotalSteps(eid);
			res.status(200).send(eventTotalSteps);
		} catch (error) {
			next(error);
		}
	};

	updateOrgEventSteps = async (req, res, next) => {
		const { eid, steps } = req.body;
		try {
			await this.orgEventsRepo.updateOrgEventSteps(eid, steps);
			res.status(200).send();
		} catch (error) {
			next(error);
		}
	};

	saveOrgEvent = async (req, res, next) => {
		const { name, orgName, orgEmail, numEmployees, projectId } = req.body;
		try {
			const newEvent = await this.orgEventsRepo.saveOrgEvent({
				name,
				orgName,
				orgEmail,
				numEmployees,
				projectId,
			});
			res.status(200).send(newEvent);
		} catch (error) {
			next(error);
		}
	};
}
