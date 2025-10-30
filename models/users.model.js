import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: {
		type: String,
		require: true,
		max: [8, "8 caracteres máximo"],
		min: [6, "6 caracteres mínimo"],
	},
	idGoogle: { type: String, default: null },
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
});

const usersModel = mongoose.model(userCollection, userSchema);
export default usersModel;
