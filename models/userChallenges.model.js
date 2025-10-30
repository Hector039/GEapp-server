import mongoose from "mongoose";

const userChallengeCollection = "userChallenges";
const userChallengeSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
	isDone: { type: Boolean, default: true },
	date: { type: Date, default: Date.now },
	triviaId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "triviaChallenges",
		required: true,
	},
});

const userChallengesModel = mongoose.model(
	userChallengeCollection,
	userChallengeSchema
);

export default userChallengesModel;
