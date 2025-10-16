import mongoose from "mongoose";

export default class UsersRepository {
	constructor(model) {
		this.usersModel = model;
	}

	getUser = async (id) => {
		if (mongoose.Types.ObjectId.isValid(id)) {
			let user = await this.usersModel.findOne({ _id: id });
			return user;
		}
		let user = await this.usersModel.findOne({
			$or: [{ email: id }, { idGoogle: id }],
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
		let obj = {};
		obj[keyToUpdate] = valueToUpdate;
		await this.usersModel.findByIdAndUpdate({ _id: id }, obj);
		return;
	};

	getNewUsersCommunity = async () => {
		let newUsers = await this.usersModel
			.find({}, { email: 1, avatar: 1 })
			.sort({ registerDate: -1 })
			.limit(5);
		return newUsers;
	};
}
