import mongoose from "mongoose";

const orgEventCollection = "orgEvents";

const orgEventSchema = new mongoose.Schema({
	name: { type: String, required: true },
	orgName: { type: String, required: true },
	orgEmail: { type: String, required: true },
	numEmployees: { type: Number, default: 0 },
	steps: { type: Number, default: 0 },
	projectId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "reforestationProjects",
		required: true,
	},
	startDate: { type: Date, default: Date.now },
	isOpen: { type: Boolean, default: true },
});

const orgEventModel = mongoose.model(orgEventCollection, orgEventSchema);
export default orgEventModel;
