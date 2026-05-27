import mongoose from "mongoose";

export default class UsersRepository {
	constructor(model) {
		this.usersModel = model;
	}

	getUser = async (id) => {
		if (mongoose.Types.ObjectId.isValid(id)) {
			let user = await this.usersModel
				.findOne({ _id: id })
				.populate({
					path: "orgEventId",
					populate: {
						path: "projectId",
					},
				})
				.select("-password")
				.lean();
			return user;
		}

		const emailRegex =
			/^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/;
		if (emailRegex.test(id)) {
			let user = await this.usersModel
				.findOne({ email: id })
				.populate({
					path: "orgEventId",
					populate: {
						path: "projectId",
					},
				})
				.select("-password")
				.lean();
			return user;
		}
		return null;
	};

	getUserWithPassword = async (id) => {
		if (mongoose.Types.ObjectId.isValid(id)) {
			let user = await this.usersModel
				.findOne({ _id: id })
				.populate({
					path: "orgEventId",
					populate: {
						path: "projectId",
					},
				})
				.lean();
			return user;
		}

		const emailRegex =
			/^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/;
		if (emailRegex.test(id)) {
			let user = await this.usersModel
				.findOne({ email: id })
				.populate({
					path: "orgEventId",
					populate: {
						path: "projectId",
					},
				})
				.lean();
			return user;
		}
		return null;
	};

	saveUser = async (user) => {
		let newUser = new this.usersModel(user).save();
		return newUser;
	};

	isEmailTaken = async (email) => {
		let user = await this.usersModel.findOne({ email: email });
		return user ? true : false;
	};

	updateUserField = async (id, keyToUpdate, valueToUpdate) => {
		if (keyToUpdate === "totalSteps" && typeof valueToUpdate === "number") {
			return await this.usersModel.findByIdAndUpdate(id, {
				$inc: { totalSteps: valueToUpdate },
			});
		}
		let obj = {};
		obj[keyToUpdate] = valueToUpdate;
		await this.usersModel.findByIdAndUpdate({ _id: id }, obj);
		return;
	};

	getUserStreak = async (id) => {
		if (mongoose.Types.ObjectId.isValid(id)) {
			let streak = await this.usersModel
				.findOne({ _id: id })
				.select("streak")
				.lean();
			return streak;
		}
		return null;
	};
}
