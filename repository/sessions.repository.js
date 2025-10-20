import mongoose from "mongoose";

export default class SessionsRepository {
	constructor(model) {
		this.sessionsModel = model;
	}

	getUserSession = async (uid, date) => {
		let session = await this.sessionsModel.findOne({ user: uid, date: date });
		return session;
	};

	saveUserSession = async (session) => {
		let sessionExists = await this.sessionsModel.findOne({
			user: uid,
			date: date,
		});
		if (sessionExists) {
			sessionExists.steps = sessionExists.steps + session.steps;
			return await sessionExists.save();
		}
		const newSession = {
			user: new mongoose.Types.ObjectId(session.uid),
			steps: session.steps || 0,
			date: session.date,
		};
		let newSessionSaved = new this.sessionsModel(newSession).save();
		return newSessionSaved;
	};
}
