import mongoose from "mongoose";

const sessionCollection = "sessions";

const sessionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
	},
	steps: { type: Number, default: 0 },
	date: { type: Date, default: Date.now },
});

const sessionsModel = mongoose.model(sessionCollection, sessionSchema);
export default sessionsModel;
