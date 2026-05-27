import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: {
		type: String,
		require: true,
	},
	orgEventId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "orgEvents",
		required: true,
	},
	lastLogin: { type: Date, default: Date.now },
	registerDate: { type: Date, default: Date.now },
	status: { type: Boolean, default: true },
	avatar: { type: String, default: null },
	totalSteps: { type: Number, default: 0 },
	recovery: {
		code: { type: String, default: null },
		expires: { type: Date, default: null },
	},
	streak: { type: Number, default: 0 },
	lastCheckReward: { type: String, default: null },
	hasSeenOnBoarding: { type: Boolean, default: false },
});

const usersModel = mongoose.model(userCollection, userSchema);
export default usersModel;
