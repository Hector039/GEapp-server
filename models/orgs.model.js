import mongoose from "mongoose";

const orgsCollection = "orgs";

const orgSchema = new mongoose.Schema({
	name: { type: String, require: true, unique: true },
	description: { type: String },
	registerDate: { type: Date, default: Date.now },
	status: { type: Boolean, default: true },
});

const orgsModel = mongoose.model(orgsCollection, orgSchema);
export default orgsModel;
