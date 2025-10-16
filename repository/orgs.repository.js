export default class OrgsRepository {
	constructor(model) {
		this.orgsModel = model;
	}

	getAllOrgs = async () => {
		let orgs = await this.orgsModel.find({});
		return orgs;
	};

	saveOrg = async (org) => {
		let newOrg = new this.orgsModel(org).save();
		return newOrg;
	};
}
