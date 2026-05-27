import mongoose from "mongoose";
import { TREE_STEP_COST } from "../constants/constants.js";

export default class OrgsEventRepository {
	constructor(model) {
		this.orgEventModel = model;
	}

	getOrgEventProgress = async (eid) => {
		let orgOpenEvents = await this.orgEventModel
			.findById(eid)
			.populate("projectId");

		const totalOrgSteps = orgOpenEvents.steps;
		const projectGoalTree = orgOpenEvents.projectId.treeGoal;

		// Calculamos los pasos totales requeridos para cumplir la meta de árboles
		const goalRequiredSteps = projectGoalTree * TREE_STEP_COST;

		// Calculamos el porcentaje de progreso (limitado a un máximo de 100%)
		let progress = (totalOrgSteps * 100) / goalRequiredSteps;
		progress = Math.min(Math.round(progress * 100) / 100, 100); // Redondeo a 2 decimales y tope de 100%

		// Calculamos cuántos árboles "ya ganaron" hasta ahora
		const treesSoFar = Math.floor(totalOrgSteps / TREE_STEP_COST);

		if (orgOpenEvents) {
			return {
				progress,
				treesSoFar,
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

	getUserOpenOrgEvent = async (invitationCode) => {
		//const domain = email.slice(email.indexOf("@") + 1);

		let orgOpenEvents = await this.orgEventModel.find({
			invitationCode: invitationCode,
			isOpen: true,
		});
		return orgOpenEvents;
	};

	findCode = async (invitationCode) => {
		let orgEvent = await this.orgEventModel.findOne({
			invitationCode: invitationCode,
		});
		return orgEvent;
	};
}
