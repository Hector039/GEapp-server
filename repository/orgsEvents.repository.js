import mongoose from "mongoose";

export default class OrgsEventRepository {
	constructor(model) {
		this.orgEventModel = model;
	}

	getOrgEventTotalSteps = async (eid) => {
		let orgOpenEvents = await this.orgEventModel
			.findById(eid)
			.populate("projectId");
		if (orgOpenEvents) {
			return {
				orgEventSteps: orgOpenEvents.steps,
				projectGoalSteps: orgOpenEvents.projectId.treeGoal,
			};
		}
		return orgOpenEvents;
	};

	updateOrgEventSteps = async (eid, newSteps) => {
		await this.orgEventModel.findByIdAndUpdate(eid, {
			$inc: { steps: newSteps },
		});
		return;
	};

	saveOrgEvent = async (newEvent) => {
		let projectIdMogoose = new mongoose.Types.ObjectId(newEvent.projectId);
		newEvent["projectId"] = projectIdMogoose;
		let newOrgEventSaved = new this.orgEventModel(newEvent).save();
		return newOrgEventSaved;
	};

	getUserOpenOrgEvent = async (email) => {
		const domain = email.slice(email.indexOf("@") + 1);

		let orgOpenEvents = await this.orgEventModel.find({
			orgEmail: { $regex: `${domain}$` },
			isOpen: true,
		});
		return orgOpenEvents;
	};
}
