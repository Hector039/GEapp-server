export default class RefProjectsRepository {
	constructor(model) {
		this.refProjectsModel = model;
	}

	getRefProject = async (pid) => {
		let project = await this.refProjectsModel.findById(pid);
		return project;
	};

	getAllRefProjects = async () => {
		let projects = await this.refProjectsModel.find({});
		return projects;
	};

	saveRefProject = async (newProject) => {
		let newProjectRef = new this.refProjectsModel(newProject).save();
		return newProjectRef;
	};

	updateRefProjectField = async (pid, keyToUpdate, valueToUpdate) => {
		let obj = {};
		obj[keyToUpdate] = valueToUpdate;
		await this.refProjectsModel.findByIdAndUpdate({ _id: pid }, obj);
		return;
	};
}
