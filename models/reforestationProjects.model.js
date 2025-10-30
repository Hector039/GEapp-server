import mongoose from "mongoose";

const reforestationProjectsCollection = "reforestationProjects";

const reforestationProjectsSchema = new mongoose.Schema({
	name: { type: String, required: true },
	location: { type: String, required: true },
	descr: { type: String, required: true },
	treeGoal: { type: Number, required: true },
	startDate: { type: Date, default: Date.now },
	isOpen: { type: Boolean, default: true },
});

const reforestationProjectsModel = mongoose.model(
	reforestationProjectsCollection,
	reforestationProjectsSchema
);
export default reforestationProjectsModel;
