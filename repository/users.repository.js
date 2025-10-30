import mongoose from "mongoose";

export default class UsersRepository {
	constructor(model) {
		this.usersModel = model;
	}

	getUser = async (id) => {
		if (mongoose.Types.ObjectId.isValid(id)) {
			let user = await this.usersModel.findOne({ _id: id }).populate({
				path: "orgEventId",
				populate: {
					path: "projectId",
				},
			});
			return user;
		}
		let user = await this.usersModel
			.findOne({
				$or: [{ email: id }, { idGoogle: id }],
			})
			.populate({
				path: "orgEventId",
				populate: {
					path: "projectId",
				},
			});
		return user;
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
		if (keyToUpdate === "totalSteps") {
			await this.usersModel.findByIdAndUpdate(id, {
				$inc: { totalSteps: valueToUpdate },
			});
		}
		let obj = {};
		obj[keyToUpdate] = valueToUpdate;
		await this.usersModel.findByIdAndUpdate({ _id: id }, obj);
		return;
	};

	getOrgUsers = async (org) => {
		let orgUsers = await this.usersModel
			.find({ org: org }, { email: 1, avatar: 1, _id: 1, totalSteps: 1 })
			.sort({ totalSteps: -1 })
			.limit(5);
		return orgUsers;
	};
}
